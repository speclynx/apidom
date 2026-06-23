import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-3-1', function () {
      context('Example Object', function () {
        context('given an externalValue field', function () {
          const fixturePath = path.join(rootFixturePath, 'external-value');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should inline the external content into the value field', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.deepEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/paths/~1a/get/responses/200/content/application~1json/examples/ex1',
                ),
              ),
              { value: { id: 42, name: 'sample' } },
            );
          });

          specify('should produce a document without external references', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'value.json');
          });
        });

        context('given both value and externalValue fields', function () {
          const fixturePath = path.join(rootFixturePath, 'value-and-external-value');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should throw because the fields are mutually exclusive', async function () {
            try {
              await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should have thrown');
            } catch (error) {
              // the bundle entry point wraps it in a BundleError; the original
              // validation error is the cause
              assert.match(((error as Error).cause as Error).message, /mutually exclusive/);
            }
          });
        });
      });
    });
  });
});
