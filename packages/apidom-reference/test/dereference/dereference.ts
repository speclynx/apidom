import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';

import {
  dereference,
  dereferenceApiDOM,
  parse,
  resolve,
  resolveApiDOM,
  Reference,
  ReferenceSet,
} from '../../src/index.ts';
import { createHTTPServer, loadJsonFile } from '../helpers.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('dereference', function () {
  const fixturePath = path.join(
    __dirname,
    'strategies',
    'openapi-3-1',
    'reference-object',
    'fixtures',
    'internal-external',
  );
  const rootFilePath = path.join(fixturePath, 'root.json');
  const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

  context('dereference', function () {
    specify('should dereference a file', async function () {
      const actual = await dereference(rootFilePath, {
        parse: { mediaType: mediaTypes.latest('json') },
      });

      assert.deepEqual(toValue(actual), expected);
    });

    specify('should match the media type per RFC 9110', async function () {
      const actual = await dereference(rootFilePath, {
        parse: { mediaType: 'Application/OpenAPI+JSON; Version=3.1.2; charset=utf-8' },
      });

      assert.deepEqual(toValue(actual), expected);
    });

    specify(
      'should detect the document given a media type that is not a string',
      async function () {
        const actual = await dereference(rootFilePath, {
          parse: { mediaType: null as unknown as string },
        });

        assert.deepEqual(toValue(actual), expected);
      },
    );

    specify('should detect the document given a blank media type', async function () {
      const actual = await dereference(rootFilePath, { parse: { mediaType: '  ' } });

      assert.deepEqual(toValue(actual), expected);
    });

    specify('should detect the document given text/plain with parameters', async function () {
      const actual = await dereference(rootFilePath, {
        parse: { mediaType: 'text/plain; charset=utf-8' },
      });

      assert.deepEqual(toValue(actual), expected);
    });
  });

  context('given provided ReferenceSet', function () {
    // the file doesn't exist, so the dereference succeeds only if the ReferenceSet is reused
    const virtualFilePath = path.join(fixturePath, 'virtual.json');
    const options = { parse: { mediaType: mediaTypes.latest('json') } };
    const createRefSet = async () =>
      new ReferenceSet({
        refs: [new Reference({ uri: virtualFilePath, value: await parse(rootFilePath, options) })],
      });

    specify('should reuse its root document given URI with dot segments', async function () {
      const refSet = await createRefSet();
      // path.join would remove the dot segments
      const uri = `${fixturePath}/../internal-external/virtual.json`;
      const actual = await dereference(uri, { ...options, dereference: { refSet } });

      assert.deepEqual(toValue(actual), expected);
    });

    specify('should reuse its root document given URI with fragment', async function () {
      const refSet = await createRefSet();
      const actual = await dereference(`${virtualFilePath}#/components`, {
        ...options,
        dereference: { refSet },
      });

      assert.deepEqual(toValue(actual), expected);
    });
  });

  context('given working directory that is not a valid URI', function () {
    specify('should dereference a file given by absolute path', async function () {
      const cwd = process.cwd();
      // a lone '%' is not a valid percent-encoding
      const invalidCwd = fs.mkdtempSync(path.join(os.tmpdir(), '100%x '));

      try {
        process.chdir(invalidCwd);
        const actual = await dereference(rootFilePath, {
          parse: { mediaType: mediaTypes.latest('json') },
        });

        assert.deepEqual(toValue(actual), expected);
      } finally {
        process.chdir(cwd);
        fs.rmSync(invalidCwd, { recursive: true });
      }
    });
  });

  context('given file:// URL with characters that need encoding', function () {
    specify('should dereference an absolute reference to the same document', async function () {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brackets-'));
      const filePath = path.join(dir, '[v1].json');
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          openapi: '3.1.0',
          components: {
            parameters: {
              a: { $ref: `file://${filePath}#/components/parameters/b` },
              b: { name: 'b', in: 'query' },
            },
          },
        }),
      );

      try {
        const actual = await dereference(`file://${filePath}`, {
          parse: { mediaType: mediaTypes.latest('json') },
          resolve: { external: false },
        });

        assert.deepEqual(toValue(actual), [
          {
            openapi: '3.1.0',
            components: {
              parameters: { a: { name: 'b', in: 'query' }, b: { name: 'b', in: 'query' } },
            },
          },
        ]);
      } finally {
        fs.rmSync(dir, { recursive: true });
      }
    });
  });

  context('given file:// URL', function () {
    const fileURL = `file://${rootFilePath}`;
    const options = { parse: { mediaType: mediaTypes.latest('json') } };

    specify('should reuse a ReferenceSet produced by resolveApiDOM', async function () {
      const parseResult = await parse(rootFilePath, options);
      const refSet = await resolveApiDOM(parseResult, {
        ...options,
        resolve: { baseURI: fileURL },
      });
      const actual = await dereference(fileURL, { ...options, dereference: { refSet } });

      assert.deepEqual(toValue(actual), expected);
      assert.strictEqual(refSet.size, 2);
    });

    specify('should produce a ReferenceSet dereferenceApiDOM reuses', async function () {
      const refSet = await resolve(fileURL, options);
      const parseResult = await parse(rootFilePath, options);
      const actual = await dereferenceApiDOM(parseResult, {
        ...options,
        resolve: { baseURI: fileURL },
        dereference: { refSet },
      });

      assert.deepEqual(toValue(actual), expected);
      assert.strictEqual(refSet.size, 2);
    });
  });

  context('given HTTP URL with fragment', function () {
    const cwd = path.join(
      __dirname,
      'strategies',
      'openapi-3-1',
      'reference-object',
      'fixtures',
      'internal-only',
    );
    const httpPort = 8123;

    specify('should retrieve the file only once', async function () {
      const httpServer = createHTTPServer({ port: httpPort, cwd });
      let requests = 0;
      httpServer.on('request', () => {
        requests += 1;
      });

      try {
        const actual = await dereference(`http://localhost:${httpPort}/root.json#/components`, {
          parse: { mediaType: mediaTypes.latest('json') },
        });

        assert.deepEqual(toValue(actual), loadJsonFile(path.join(cwd, 'dereferenced.json')));
        assert.strictEqual(requests, 1);
      } finally {
        await httpServer.terminate();
      }
    });
  });
});
