import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element, ParseResultElement, isParseResultElement } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-2';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle, resolve } from '../../../../../src/index.ts';
import MaximumBundleDepthError from '../../../../../src/errors/MaximumBundleDepthError.ts';
import UnresolvableReferenceError from '../../../../../src/errors/UnresolvableReferenceError.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-2', function () {
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

          specify('should hoist external Parameter Object into parameters', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/parameters/externalParameter/name')),
              'filter',
            );
          });

          specify('should hoist external Response Object into responses', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/responses/externalResponse/description'),
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
              '/parameters/externalParameter',
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
              [{ $ref: '#/parameters/userId' }, { $ref: '#/parameters/externalParameter' }],
            );
            assert.deepEqual(
              toValue(
                evaluate(bundled.result as Element, '/paths/~1users~1{userId}/get/responses/200'),
              ),
              { $ref: '#/responses/externalResponse' },
            );
          });

          specify('should preserve internal Reference Objects untouched', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/parameters/userId/name')),
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
              { $ref: '#/parameters/userId' },
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
              { $ref: '#/parameters/userId' },
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

        context('given distinct external targets with identical content', function () {
          const fixturePath = path.join(rootFixturePath, 'dedup-equal');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should hoist each target into its own component', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            // identical content is not merged: each distinct target keeps its
            // own component (and origin), matching libopenapi's bundling
            assert.hasAllKeys(
              toValue(evaluate(bundled.result as Element, '/parameters')) as object,
              ['SharedParam', 'AlsoShared'],
            );
          });

          specify('should point each reference at its own component', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/parameters/0/$ref')),
              '#/parameters/SharedParam',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1b/get/parameters/0/$ref')),
              '#/parameters/AlsoShared',
            );
          });
        });

        context('given external references colliding on name with different content', function () {
          const fixturePath = path.join(rootFixturePath, 'collision-different');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should keep both as distinct, suffix-renamed components', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.lengthOf(
              Object.keys(toValue(evaluate(bundled.result as Element, '/parameters')) as object),
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
                bundle: { strategyOpts: { 'openapi-2': { onComponentNameCollision: 'off' } } },
              });

              assert.lengthOf(bundled.warnings, 0);
            },
          );
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
            const fragment = evaluate<Element>(bundled.result as Element, '/responses/Pet');

            assert.isDefined(toValue(fragment));
          });

          specify(
            'should hoist the nested external Schema Object into definitions',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });

              assert.property(
                toValue(evaluate(bundled.result as Element, '/definitions')) as object,
                'PetSchema',
              );
            },
          );
        });

        context('given an external reference indirected through another reference', function () {
          const fixturePath = path.join(rootFixturePath, 'external-indirection');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should hoist every hop of the indirection chain', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const parameters = toValue(
              evaluate(bundled.result as Element, '/parameters'),
            ) as Record<string, unknown>;

            // the indirection (A) and its eventual target (B) are both hoisted
            assert.hasAllKeys(parameters, ['A', 'B']);
          });

          specify('should keep the chain as internal references', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/parameters/0/$ref')),
              '#/parameters/A',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/parameters/A/$ref')),
              '#/parameters/B',
            );
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ex1.json');
            assert.notInclude(serialized, 'ex2.json');
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
              toValue(evaluate(bundled.result as Element, '/parameters')) as object,
              'Thing',
            );
            assert.property(
              toValue(evaluate(bundled.result as Element, '/responses')) as object,
              'Thing',
            );
          });

          specify('should point each reference at its own bucket', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/parameters/0/$ref')),
              '#/parameters/Thing',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/responses/200/$ref')),
              '#/responses/Thing',
            );
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
              toValue(evaluate(bundled.result as Element, '/parameters')) as object,
              'NullableParam',
            );
          });
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
              { $ref: '#/parameters/p' },
            );
            assert.hasAllKeys(
              toValue(evaluate(bundled.result as Element, '/parameters')) as object,
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
              toValue(evaluate(bundled.result as Element, '/parameters')) as object,
              'Param',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/paths/~1a/get/parameters/0/$ref')),
              '#/parameters/Param',
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
              toValue(evaluate(bundled.result as Element, '/parameters')) as object,
              'externalParameter',
            );
            assert.property(
              toValue(evaluate(bundled.result as Element, '/responses')) as object,
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

          specify('should throw UnresolvableReferenceError by default', async function () {
            try {
              await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should have thrown');
            } catch (error) {
              assert.instanceOf(error, UnresolvableReferenceError);
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
            assert.instanceOf(errors[0], UnresolvableReferenceError);
          });
        });
      });
    });
  });
});
