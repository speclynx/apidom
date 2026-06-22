import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-0';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-3-0', function () {
      context('Link Object', function () {
        context('given an external operationRef', function () {
          const fixturePath = path.join(rootFixturePath, 'operation-ref-external');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should rewrite operationRef to an absolute URI', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const operationRef = toValue(
              evaluate(bundled.result as Element, '/components/links/link1/operationRef'),
            ) as string;

            assert.isFalse(operationRef.startsWith('./'));
            assert.include(operationRef, 'ex.json#/paths/~1things/get');
          });

          specify('should not inline the referenced operation', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const link1 = toValue(
              evaluate(bundled.result as Element, '/components/links/link1'),
            ) as object;

            assert.hasAllKeys(link1, ['operationRef']);
          });
        });

        context('given an internal operationRef', function () {
          const fixturePath = path.join(rootFixturePath, 'operation-ref-internal');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should leave the operationRef untouched', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const operationRef = toValue(
              evaluate(bundled.result as Element, '/components/links/link1/operationRef'),
            ) as string;

            assert.strictEqual(operationRef, '#/paths/~1things/get');
          });
        });

        context('given both operationRef and operationId', function () {
          const fixturePath = path.join(rootFixturePath, 'operation-ref-id-both-defined');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should throw because the fields are mutually exclusive', async function () {
            try {
              await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should have thrown');
            } catch (error) {
              assert.match(((error as Error).cause as Error).message, /mutually exclusive/);
            }
          });
        });
      });
    });
  });
});
