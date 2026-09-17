import path from 'node:path';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';
import { fileURLToPath } from 'node:url';

import { loadJsonFile } from '../../../../helpers.ts';
import { dereference } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('dereference', function () {
  context('strategies', function () {
    context('openapi-3-1', function () {
      context('Response Object', function () {
        context('given in components/responses field', function () {
          const fixturePath = path.join(rootFixturePath, 'components-responses');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given in Responses Object', function () {
          const fixturePath = path.join(rootFixturePath, 'responses-object');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given external and containing a self-identifying schema', function () {
          const fixturePath = path.join(rootFixturePath, 'external-schema-id');

          specify('should dereference', async function () {
            // the schema's $ref resolves within the resource its absolute $id
            // identifies, which lives in the external Response Object, not in
            // the external document refracted as a JSON Schema
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });
      });
    });
  });
});
