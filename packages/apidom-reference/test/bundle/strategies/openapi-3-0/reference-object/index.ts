import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element, ParseResultElement, isParseResultElement } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-0';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle, resolve } from '../../../../../src/index.ts';
import MaximumBundleDepthError from '../../../../../src/errors/MaximumBundleDepthError.ts';
import UnresolvableBundleReferenceError from '../../../../../src/errors/UnresolvableBundleReferenceError.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-3-0', function () {
      context('Reference Object', function () {
        context('given Reference Objects pointing internally and externally', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-external');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should produce a ParseResultElement', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.isTrue(isParseResultElement(bundled));
          });

          specify('should hoist external Parameter Object into components', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/parameters/externalParameter/name',
                ),
              ),
              'filter',
            );
          });

          specify('should hoist external Response Object into components', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/responses/externalResponse/description',
                ),
              ),
              'external response',
            );
          });

          specify('should annotate hoisted components with their origin', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const fragment = evaluate<Element>(
              bundled.result as Element,
              '/components/parameters/externalParameter',
            );

            assert.match(toValue(fragment.meta.get('ref-origin')) as string, /ex\.json$/);
          });

          specify('should rewrite external $refs to internal pointers', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.deepEqual(
              toValue(
                evaluate(bundled.result as Element, '/paths/~1users~1{userId}/get/parameters'),
              ),
              [
                { $ref: '#/components/parameters/userId' },
                { $ref: '#/components/parameters/externalParameter' },
              ],
            );
            assert.deepEqual(
              toValue(
                evaluate(bundled.result as Element, '/paths/~1users~1{userId}/get/responses/200'),
              ),
              {
                $ref: '#/components/responses/externalResponse',
              },
            );
          });

          specify('should preserve internal Reference Objects untouched', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/parameters/userId/name')),
              'userId',
            );
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ex.json');
          });

          specify(
            'should leave external $refs intact given resolve.external=false',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { external: false },
              });
              const serialized = JSON.stringify(toValue(bundled.result as Element));

              assert.include(serialized, 'ex.json');
            },
          );

          specify('should keep internal $refs as internal references', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.deepEqual(
              toValue(
                evaluate(bundled.result as Element, '/paths/~1users~1{userId}/get/parameters/0'),
              ),
              {
                $ref: '#/components/parameters/userId',
              },
            );
          });
        });

        context('given a self-file Reference Object', function () {
          const fixturePath = path.join(rootFixturePath, 'self-file');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should normalize the $ref to a bare fragment', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.deepEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1users/get/parameters/0')),
              {
                $ref: '#/components/parameters/userId',
              },
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

        context('given external references with deeply equal targets', function () {
          const fixturePath = path.join(rootFixturePath, 'dedup-equal');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should collapse them into a single component', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.lengthOf(
              Object.keys(
                toValue(evaluate(bundled.result as Element, '/components/parameters')) as object,
              ),
              1,
            );
          });

          specify('should point both references at the same component', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/parameters/0/$ref')),
              toValue(evaluate(bundled.result as Element, '/paths/~1b/get/parameters/0/$ref')),
            );
          });
        });

        context(
          'given deeply equal targets from different documents with relative refs',
          function () {
            const fixturePath = path.join(rootFixturePath, 'dedup-relative-refs');
            const rootFilePath = path.join(fixturePath, 'root.json');

            specify(
              'should NOT collapse them (their relative refs resolve differently)',
              async function () {
                const bundled = await bundle(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                });
                const schemas = toValue(
                  evaluate(bundled.result as Element, '/components/schemas'),
                ) as Record<string, unknown>;

                // both Wrap fragments and both distinct models are kept
                assert.hasAllKeys(schemas, ['Wrap', 'Wrap-2', 'M', 'M-2']);
              },
            );
          },
        );

        context('given external references colliding on name with different content', function () {
          const fixturePath = path.join(rootFixturePath, 'collision-different');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should keep both as distinct, suffix-renamed components', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.lengthOf(
              Object.keys(
                toValue(evaluate(bundled.result as Element, '/components/parameters')) as object,
              ),
              2,
            );
            assert.notStrictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/parameters/0/$ref')),
              toValue(evaluate(bundled.result as Element, '/paths/~1b/get/parameters/0/$ref')),
            );
          });

          specify('should warn about the rename via a parse-result annotation', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.lengthOf(bundled.warnings, 1);
            assert.include(toValue(bundled.warnings.first as Element) as string, 'Renamed');
          });

          specify(
            'should suppress the warning given onComponentNameCollision="off"',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: { onComponentNameCollision: 'off' },
              });

              assert.lengthOf(bundled.warnings, 0);
            },
          );

          specify('should throw given onComponentNameCollision="error"', async function () {
            try {
              await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: { onComponentNameCollision: 'error' },
              });
              assert.fail('should have thrown');
            } catch (error) {
              assert.strictEqual((error as Error).constructor.name, 'BundleError');
            }
          });

          specify(
            'should support per-strategy override via bundle.strategyOpts',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: { strategyOpts: { 'openapi-3-0': { onComponentNameCollision: 'off' } } },
              });

              assert.lengthOf(bundled.warnings, 0);
            },
          );
        });

        context('given an external reference with a dotted JSON Pointer key', function () {
          const fixturePath = path.join(rootFixturePath, 'dotted-pointer-keys');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should preserve the dotted key as the component name', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/schemas')) as object,
              'my.org.User',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/paths/~1a/get/responses/200/content/application~1json/schema/$ref',
                ),
              ),
              '#/components/schemas/my.org.User',
            );
          });
        });

        context('given nested external Reference Objects', function () {
          const fixturePath = path.join(rootFixturePath, 'external-nested');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should transitively hoist nested external fragments', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'a.json');
            assert.notInclude(serialized, 'b.json');
          });

          specify('should hoist the top-level external Response Object', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const fragment = evaluate<Element>(
              bundled.result as Element,
              '/components/responses/Pet',
            );

            assert.isDefined(toValue(fragment));
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
              toValue(evaluate(bundled.result as Element, '/components/schemas')) as object,
              ['A', 'B'],
            );
          });

          specify('should rewrite the cycle to internal pointers', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.deepEqual(
              toValue(evaluate(bundled.result as Element, '/components/schemas/A/properties/b')),
              {
                $ref: '#/components/schemas/B',
              },
            );
            assert.deepEqual(
              toValue(evaluate(bundled.result as Element, '/components/schemas/B/properties/a')),
              {
                $ref: '#/components/schemas/A',
              },
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

        context('given the same external target referenced in two different contexts', function () {
          const fixturePath = path.join(rootFixturePath, 'same-target-two-contexts');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should hoist it into each context-appropriate bucket', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/parameters')) as object,
              'Thing',
            );
            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/responses')) as object,
              'Thing',
            );
          });

          specify('should point each reference at its own bucket', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/parameters/0/$ref')),
              '#/components/parameters/Thing',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/responses/200/$ref')),
              '#/components/responses/Thing',
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
              toValue(evaluate(bundled.result as Element, '/components/schemas')) as object,
              'Foo/Bar',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/paths/~1a/get/responses/200/content/application~1json/schema/$ref',
                ),
              ),
              '#/components/schemas/Foo~1Bar',
            );
          });
        });

        context('given external references across all Components Object fields', function () {
          const fixturePath = path.join(rootFixturePath, 'all-component-types');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should hoist each into its matching components field', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/requestBodies')) as object,
              'RB',
            );
            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/parameters')) as object,
              'Param',
            );
            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/headers')) as object,
              'Head',
            );
            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/callbacks')) as object,
              'CB',
            );
            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/securitySchemes')) as object,
              'Sec',
            );
          });

          specify('should rewrite every reference to an internal pointer', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/post/requestBody/$ref')),
              '#/components/requestBodies/RB',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/post/parameters/0/$ref')),
              '#/components/parameters/Param',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/paths/~1a/post/responses/200/headers/X-H/$ref',
                ),
              ),
              '#/components/headers/Head',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/post/callbacks/cb/$ref')),
              '#/components/callbacks/CB',
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

        context('given a document with null values', function () {
          const fixturePath = path.join(rootFixturePath, 'with-nulls');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should bundle without failing', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/parameters')) as object,
              'NullableParam',
            );
          });
        });

        context('given an external $ref inside a specification extension field', function () {
          const fixturePath = path.join(rootFixturePath, 'extension-ref');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify(
            'should leave the extension $ref untouched (consistent with dereference)',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });

              assert.deepEqual(
                toValue(evaluate(bundled.result as Element, '/paths/~1a/get/x-custom')),
                {
                  schema: { $ref: './ex.json#/ExtSchema' },
                },
              );
            },
          );
        });

        context('given a document with only internal references', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-only');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should leave the document unchanged', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.deepEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/parameters/0')),
              {
                $ref: '#/components/parameters/p',
              },
            );
            assert.hasAllKeys(
              toValue(evaluate(bundled.result as Element, '/components/parameters')) as object,
              ['p'],
            );
          });
        });

        context('given a YAML document', function () {
          const fixturePath = path.join(rootFixturePath, 'yaml-input');
          const rootFilePath = path.join(fixturePath, 'root.yaml');

          specify('should bundle regardless of serialization format', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('yaml') },
            });

            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/parameters')) as object,
              'Param',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/parameters/0/$ref')),
              '#/components/parameters/Param',
            );
          });
        });

        context('given a chain of external references exceeding bundle.maxDepth', function () {
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

          specify('should bundle the whole chain when maxDepth is not exceeded', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ex1.json');
            assert.notInclude(serialized, 'ex2.json');
            assert.notInclude(serialized, 'ex3.json');
          });
        });

        context('given a pre-computed refSet', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-external');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should bundle using the provided refSet', async function () {
            const refSet = await resolve(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              bundle: { refSet },
            });

            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/parameters')) as object,
              'externalParameter',
            );
            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/responses')) as object,
              'externalResponse',
            );
          });

          specify(
            'should not mutate the provided refSet (immutable by default)',
            async function () {
              const refSet = await resolve(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const entry = refSet.find((ref) => ref.uri.endsWith('root.json'))!;
              const before = JSON.stringify(toValue((entry.value as ParseResultElement).result));

              await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: { refSet },
              });
              const after = JSON.stringify(toValue((entry.value as ParseResultElement).result));

              assert.strictEqual(before, after);
            },
          );

          specify('should mutate the provided refSet given immutable=false', async function () {
            const refSet = await resolve(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const entry = refSet.find((ref) => ref.uri.endsWith('root.json'))!;
            const before = JSON.stringify(toValue((entry.value as ParseResultElement).result));

            await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              bundle: { refSet, immutable: false },
            });
            const after = JSON.stringify(toValue((entry.value as ParseResultElement).result));

            assert.notStrictEqual(before, after);
          });
        });

        context('given an unresolvable external reference', function () {
          const fixturePath = path.join(rootFixturePath, 'unresolvable');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should throw UnresolvableBundleReferenceError by default', async function () {
            try {
              await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should have thrown');
            } catch (error) {
              assert.instanceOf(error, UnresolvableBundleReferenceError);
            }
          });

          specify('should skip and continue given continueOnError=true', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              bundle: { continueOnError: true },
            });

            // the unresolved $ref is left in place
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/parameters/0/$ref')),
              './missing.json#/Nope',
            );
          });

          specify('should collect errors given a continueOnError callback', async function () {
            const errors: Error[] = [];
            await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              bundle: { continueOnError: (error: Error) => errors.push(error) },
            });

            assert.lengthOf(errors, 1);
            assert.instanceOf(errors[0], UnresolvableBundleReferenceError);
          });
        });
      });
    });
  });
});
