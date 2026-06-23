import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle } from '../../../../../src/index.ts';
import MaximumBundleDepthError from '../../../../../src/errors/MaximumBundleDepthError.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-3-1', function () {
      context('Path Item Object', function () {
        context('given multiple references to the same external Path Item', function () {
          const fixturePath = path.join(rootFixturePath, 'external-shared');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should hoist the Path Item into components.pathItems', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.isDefined(
              toValue(evaluate(bundled.result as Element, '/components/pathItems/SharedPath/get')),
            );
          });

          specify(
            'should rewrite every occurrence to the same internal pointer',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });

              assert.strictEqual(
                toValue(evaluate(bundled.result as Element, '/paths/~1a/$ref')),
                '#/components/pathItems/SharedPath',
              );
              assert.strictEqual(
                toValue(evaluate(bundled.result as Element, '/paths/~1b/$ref')),
                '#/components/pathItems/SharedPath',
              );
            },
          );

          specify('should hoist a Reference nested inside the Path Item', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/pathItems/SharedPath/get/responses/200/$ref',
                ),
              ),
              '#/components/responses/SharedResponse',
            );
            assert.isDefined(
              toValue(evaluate(bundled.result as Element, '/components/responses/SharedResponse')),
            );
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'shared.json');
          });
        });

        context('given an entry reference to a Path Item that references a Response', function () {
          const fixturePath = path.join(rootFixturePath, 'nested-reference-chain');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should hoist both the Path Item and the nested Response', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/$ref')),
              '#/components/pathItems/SharedPath',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/pathItems/SharedPath/get/responses/200/$ref',
                ),
              ),
              '#/components/responses/SharedResponse',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/responses/SharedResponse/description',
                ),
              ),
              'shared response',
            );
          });
        });

        context('given an external Path Item referencing another Path Item', function () {
          const fixturePath = path.join(rootFixturePath, 'external-chain');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should hoist each Path Item in the chain', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/$ref')),
              '#/components/pathItems/PathA',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/pathItems/PathA/$ref')),
              '#/components/pathItems/PathB',
            );
            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/components/pathItems/PathB/get/operationId'),
              ),
              'realOperation',
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

        context('given a circular external Path Item reference', function () {
          const fixturePath = path.join(rootFixturePath, 'external-circular');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should terminate and break the cycle with internal pointers', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            // unlike OpenAPI 3.0 (which keeps the external cycle-breaking $ref in
            // place), 3.1 hoists the Path Items and rewrites the cycle to internal
            // pointers
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/$ref')),
              '#/components/pathItems/PathA',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/pathItems/PathA/$ref')),
              '#/components/pathItems/PathB',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/pathItems/PathB/$ref')),
              '#/components/pathItems/PathA',
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

        context('given a referencing Path Item with sibling fields', function () {
          const fixturePath = path.join(rootFixturePath, 'sibling-fields');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify(
            'should preserve the sibling fields on the referencing element',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });

              assert.strictEqual(
                toValue(evaluate(bundled.result as Element, '/paths/~1a/summary')),
                'local summary',
              );
              assert.strictEqual(
                toValue(evaluate(bundled.result as Element, '/paths/~1a/description')),
                'local description',
              );
              assert.strictEqual(
                toValue(evaluate(bundled.result as Element, '/paths/~1a/$ref')),
                '#/components/pathItems/SharedPath',
              );
            },
          );
        });

        context('given an external Path Item chain exceeding bundle.maxDepth', function () {
          const fixturePath = path.join(rootFixturePath, 'max-depth');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should throw a MaximumBundleDepthError', async function () {
            try {
              await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: { maxDepth: 1 },
              });
              assert.fail('should have thrown');
            } catch (error) {
              assert.instanceOf((error as Error).cause, MaximumBundleDepthError);
            }
          });

          specify('should follow the whole chain when maxDepth is not exceeded', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/components/pathItems/PathC/get/operationId'),
              ),
              'deep',
            );
          });
        });
      });
    });
  });
});
