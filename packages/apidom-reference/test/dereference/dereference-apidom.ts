import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { mediaTypes, refractOpenApi3_1 } from '@speclynx/apidom-ns-openapi-3-1';

import { dereferenceApiDOM, parse } from '../../src/index.ts';
import { loadJsonFile } from '../helpers.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('dereferenceApiDOM', function () {
  const fixturePath = path.join(
    __dirname,
    'strategies',
    'openapi-3-1',
    'reference-object',
    'fixtures',
    'internal-only',
  );
  const rootFilePath = path.join(fixturePath, 'root.json');
  const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

  context('given no baseURI is provided', function () {
    specify('should dereference an ApiDOM fragment using CWD as baseURI', async function () {
      const fragment = await parse(rootFilePath, {
        parse: { mediaType: mediaTypes.latest('json') },
      });
      const actual = await dereferenceApiDOM(fragment);

      assert.deepEqual(toValue(actual), expected);
    });
  });

  context('given fragment is instance of ParseResultElement', function () {
    specify('should dereference an ApiDOM fragment', async function () {
      const fragment = await parse(rootFilePath, {
        parse: { mediaType: mediaTypes.latest('json') },
      });
      const actual = await dereferenceApiDOM(fragment, { resolve: { baseURI: rootFilePath } });

      assert.deepEqual(toValue(actual), expected);
    });
  });

  context("given fragment isn't instance of ParseResultElement", function () {
    specify('should dereference an ApiDOM fragment', async function () {
      const { api } = await parse(rootFilePath, {
        parse: { mediaType: mediaTypes.latest('json') },
      });

      // @ts-ignore
      const actual = await dereferenceApiDOM(api, {
        resolve: { baseURI: rootFilePath },
      });

      assert.deepEqual(toValue(actual), expected[0]);
    });
  });

  context('given baseURI is not normalized', function () {
    // with external resolution off, missing the root document leaves the internal
    // references unresolved instead of retrieving the base URI over the network
    const dereferenceWithBaseURI = async (baseURI: string) => {
      const fragment = await parse(rootFilePath, {
        parse: { mediaType: mediaTypes.latest('json') },
      });
      return dereferenceApiDOM(fragment, { resolve: { baseURI, external: false } });
    };

    specify('should dereference an ApiDOM fragment given URL without path', async function () {
      const actual = await dereferenceWithBaseURI('https://example.com');

      assert.deepEqual(toValue(actual), expected);
    });

    specify(
      'should dereference an ApiDOM fragment given URL with uppercase host',
      async function () {
        const actual = await dereferenceWithBaseURI('https://EXAMPLE.com/root.json');

        assert.deepEqual(toValue(actual), expected);
      },
    );

    specify('should dereference an ApiDOM fragment given URL with default port', async function () {
      const actual = await dereferenceWithBaseURI('https://example.com:443/root.json');

      assert.deepEqual(toValue(actual), expected);
    });

    specify('should dereference an ApiDOM fragment given URL with dot segments', async function () {
      const actual = await dereferenceWithBaseURI('https://example.com/v1/../root.json');

      assert.deepEqual(toValue(actual), expected);
    });

    specify(
      'should dereference an ApiDOM fragment given file system path with dot segments',
      async function () {
        const actual = await dereferenceWithBaseURI(`${fixturePath}/../internal-only/root.json`);

        assert.deepEqual(toValue(actual), expected);
      },
    );
  });

  context('given baseURI has an opaque path', function () {
    specify('should dereference an ApiDOM fragment', async function () {
      const document = { openapi: '3.1.0', info: { title: 'URN', version: '1.0.0' } };
      const fragment = refractOpenApi3_1(document);
      const actual = await dereferenceApiDOM(fragment, {
        parse: { mediaType: mediaTypes.latest('json') },
        resolve: { baseURI: 'urn:example:openapi' },
      });

      assert.deepEqual(toValue(actual), document);
    });
  });
});
