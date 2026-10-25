import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-0';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle } from '../../../../../src/index.ts';
import MaximumBundleDepthError from '../../../../../src/errors/MaximumBundleDepthError.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-3-0', function () {
      context('Path Item Object', function () {
        context('given multiple references to the same external Path Item', function () {
          const fixturePath = path.join(rootFixturePath, 'external-shared');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should inline each occurrence in place', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.isDefined(toValue(evaluate(bundled.result as Element, '/paths/~1a/get')));
            assert.isDefined(toValue(evaluate(bundled.result as Element, '/paths/~1b/get')));
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'shared.json');
          });
        });

        context('given an external Path Item referencing another Path Item', function () {
          const fixturePath = path.join(rootFixturePath, 'external-chain');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should follow the chain to the eventual Path Item', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/operationId')),
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

          specify('should terminate and keep the cycle-breaking $ref in place', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            // the cycle cannot be inlined, so the Path Item retains its $ref
            // rather than collapsing to an empty object
            assert.deepEqual(toValue(evaluate(bundled.result as Element, '/paths/~1a')), {
              $ref: './ex.json#/PathA',
            });
          });
        });

        // a hang here would not fail the test: the loop never yields to timers, so mocha's
        // timeout does not fire either
        context('given a circular external Path Item reference through a callback', function () {
          const fixturePath = path.join(rootFixturePath, 'callback-circular');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should terminate and keep the cycle-breaking $ref in place', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.deepEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/paths/~1a/get/callbacks/onEvent/{$request.body#~1url}',
                ),
              ),
              { $ref: './paths.json#/A' },
            );
          });

          specify('should bundle the fields of the referencing Path Item', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.deepEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/parameters')),
              [{ $ref: '#/components/parameters/Limit' }],
            );
          });
        });

        context('given a circular Path Item reference through a callback by fragment', function () {
          const fixturePath = path.join(rootFixturePath, 'callback-circular-fragment');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify(
            'should rewrite the cycle-breaking $ref against the entry document',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });

              assert.deepEqual(
                toValue(
                  evaluate(
                    bundled.result as Element,
                    '/paths/~1a/get/callbacks/onEvent/{$request.body#~1url}',
                  ),
                ),
                { $ref: 'nested/paths.json#/A' },
              );
            },
          );
        });

        context(
          'given a circular Path Item reference through callbacks across directories',
          function () {
            const fixturePath = path.join(rootFixturePath, 'callback-circular-cross-directory');
            const rootFilePath = path.join(fixturePath, 'root.json');

            specify(
              'should rewrite the cycle-breaking $ref against the entry document',
              async function () {
                const bundled = await bundle(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                });

                assert.deepEqual(
                  toValue(
                    evaluate(
                      bundled.result as Element,
                      '/paths/~1a/post/callbacks/onEvent/{$request.body#~1url}/get/callbacks/onEvent/{$request.body#~1url}',
                    ),
                  ),
                  { $ref: 'sub/a.json#/A' },
                );
              },
            );
          },
        );

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
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/operationId')),
              'deep',
            );
          });
        });
      });
    });
  });
});
