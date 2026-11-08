import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { isParseResultElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';

import { bundle, parse, resolve, Reference, ReferenceSet } from '../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('bundle', function () {
  const fixturePath = path.join(
    __dirname,
    'strategies',
    'openapi-3-1',
    'reference-object',
    'fixtures',
    'internal-external',
  );
  const rootFilePath = path.join(fixturePath, 'root.json');

  specify('should bundle a file', async function () {
    const bundled = await bundle(rootFilePath, {
      parse: { mediaType: mediaTypes.latest('json') },
    });

    assert.isTrue(isParseResultElement(bundled));
  });

  specify('should detect the document given a media type that is not a string', async function () {
    const bundled = await bundle(rootFilePath, {
      parse: { mediaType: null as unknown as string },
    });

    assert.strictEqual(bundled.api?.element, 'openApi3_1');
  });

  specify('should match the media type per RFC 9110', async function () {
    const bundled = await bundle(rootFilePath, {
      parse: { mediaType: 'Application/OpenAPI+JSON; Version=3.1.2; charset=utf-8' },
    });

    assert.strictEqual(bundled.api?.element, 'openApi3_1');
  });

  context('given URI with dot segments', function () {
    specify('should bundle the file as if the URI was normalized', async function () {
      const options = { parse: { mediaType: mediaTypes.latest('json') } };
      // path.join would remove the dot segments
      const bundled = await bundle(`${fixturePath}/../internal-external/root.json`, options);
      const expected = await bundle(rootFilePath, options);

      assert.deepEqual(toValue(bundled), toValue(expected));
    });
  });

  context('given provided ReferenceSet and URI with fragment', function () {
    specify('should reuse its root document', async function () {
      const options = { parse: { mediaType: mediaTypes.latest('json') } };
      // the file doesn't exist, so the bundle succeeds only if the ReferenceSet is reused
      const virtualFilePath = path.join(fixturePath, 'virtual.json');
      const refSet = new ReferenceSet({
        refs: [new Reference({ uri: virtualFilePath, value: await parse(rootFilePath, options) })],
      });
      const bundled = await bundle(`${virtualFilePath}#/components`, {
        ...options,
        bundle: { refSet },
      });
      const expected = await bundle(rootFilePath, options);

      assert.deepEqual(toValue(bundled), toValue(expected));
    });
  });

  context('given file:// URL', function () {
    specify('should reuse a ReferenceSet produced by resolve', async function () {
      const options = { parse: { mediaType: mediaTypes.latest('json') } };
      const fileURL = `file://${rootFilePath}`;
      const refSet = await resolve(fileURL, options);
      const bundled = await bundle(fileURL, { ...options, bundle: { refSet } });
      const expected = await bundle(rootFilePath, options);

      assert.deepEqual(toValue(bundled), toValue(expected));
      assert.strictEqual(refSet.size, 2);
    });
  });
});
