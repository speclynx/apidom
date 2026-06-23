import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element, isParseResultElement } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-2';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-2', function () {
      context('JSON Reference Object', function () {
        context('given JSON Reference Objects pointing internally and externally', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-external');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should produce a ParseResultElement', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.isTrue(isParseResultElement(bundled));
          });

          specify('should hoist external Schema Object into definitions', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/definitions/Pet/type')),
              'object',
            );
          });

          specify('should rewrite the external $ref to an internal pointer', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/paths/~1pets/get/responses/200/schema/$ref'),
              ),
              '#/definitions/Pet',
            );
          });

          specify('should preserve internal Schema references untouched', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/paths/~1pets/get/responses/400/schema/$ref'),
              ),
              '#/definitions/LocalError',
            );
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ex.json');
          });
        });

        context('given a self-file Schema reference', function () {
          const fixturePath = path.join(rootFixturePath, 'self-file');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should normalize the $ref to a bare fragment', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/paths/~1pets/get/responses/200/schema/$ref'),
              ),
              '#/definitions/Pet',
            );
          });

          specify('should produce a transferable document', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'root.json');
          });
        });

        context('given a body Parameter Object whose schema is an external reference', function () {
          const fixturePath = path.join(rootFixturePath, 'body-param-schema');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should hoist the schema into definitions, not parameters', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.property(
              toValue(evaluate(bundled.result as Element, '/definitions')) as object,
              'Pet',
            );
            assert.notProperty(
              toValue(evaluate(bundled.result as Element, '')) as object,
              'parameters',
            );
          });

          specify('should rewrite the body schema $ref to an internal pointer', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/paths/~1pets/post/parameters/0/schema/$ref'),
              ),
              '#/definitions/Pet',
            );
          });
        });

        context('given an external reference with a dotted JSON Pointer key', function () {
          const fixturePath = path.join(rootFixturePath, 'dotted-pointer-keys');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should preserve the dotted key as the component name', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.property(
              toValue(evaluate(bundled.result as Element, '/definitions')) as object,
              'my.org.User',
            );
            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/paths/~1a/get/responses/200/schema/$ref'),
              ),
              '#/definitions/my.org.User',
            );
          });
        });

        context('given an external reference whose pointer token contains a slash', function () {
          const fixturePath = path.join(rootFixturePath, 'pointer-escape');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should escape the slash in the internal pointer', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.property(
              toValue(evaluate(bundled.result as Element, '/definitions')) as object,
              'Foo/Bar',
            );
            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/paths/~1a/get/responses/200/schema/$ref'),
              ),
              '#/definitions/Foo~1Bar',
            );
          });
        });

        context('given circular external Schema Objects', function () {
          const fixturePath = path.join(rootFixturePath, 'external-circular-schema');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should terminate and hoist both schemas once', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.hasAllKeys(
              toValue(evaluate(bundled.result as Element, '/definitions')) as object,
              ['A', 'B'],
            );
          });

          specify('should rewrite the cycle to internal pointers', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.deepEqual(
              toValue(evaluate(bundled.result as Element, '/definitions/A/properties/b')),
              { $ref: '#/definitions/B' },
            );
            assert.deepEqual(
              toValue(evaluate(bundled.result as Element, '/definitions/B/properties/a')),
              { $ref: '#/definitions/A' },
            );
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ex.json');
          });
        });
      });
    });
  });
});
