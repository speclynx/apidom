import path from 'node:path';
import { assert } from 'chai';
import { ParseResultElement, Element } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { isParameterElement, mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';
import { evaluate } from '@speclynx/apidom-json-pointer';
import { fileURLToPath } from 'node:url';

import { loadJsonFile } from '../../../../helpers.ts';
import { dereference, dereferenceApiDOM, resolve, parse } from '../../../../../src/index.ts';
import DereferenceError from '../../../../../src/errors/DereferenceError.ts';
import MaximumDereferenceDepthError from '../../../../../src/errors/MaximumDereferenceDepthError.ts';
import MaximumResolveDepthError from '../../../../../src/errors/MaximumResolveDepthError.ts';
import Reference from '../../../../../src/Reference.ts';
import ReferenceSet from '../../../../../src/ReferenceSet.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('dereference', function () {
  context('strategies', function () {
    context('openapi-3-1', function () {
      context('Reference Object', function () {
        context('given Reference Objects pointing internally and externally', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-external');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });

          specify('should apply semantics to external fragment', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const dereferenced = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const fragment = evaluate(dereferenced, '/0/components/parameters/externalRef');

            assert.isTrue(isParameterElement(fragment));
          });

          specify(
            'should annotate transcluded element with additional metadata',
            async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const dereferenced = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const fragment = evaluate<Element>(dereferenced, '/0/components/parameters/userId');

              assert.strictEqual(
                (fragment.meta.get('ref-fields') as Record<string, unknown>)['$ref'],
                '#/components/parameters/indirection1',
              );
              assert.strictEqual(
                (fragment.meta.get('ref-fields') as Record<string, unknown>)['description'],
                'override',
              );
            },
          );
        });

        context('given Reference Objects pointing internally only', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-only');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects pointing externally only', function () {
          const fixturePath = path.join(rootFixturePath, 'external-only');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects pointing to external cycles', function () {
          const fixturePath = path.join(rootFixturePath, 'external-cycle');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const dereferenced = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const parent = evaluate<Element>(
              dereferenced,
              '/0/components/schemas/externalSchema/properties',
            );

            const cyclicParent = evaluate<Element>(
              dereferenced,
              '/0/components/schemas/externalSchema/properties/parent/properties',
            );

            assert.strictEqual(parent, cyclicParent);
          });
        });

        context('given Reference Objects pointing to external indirections', function () {
          const fixturePath = path.join(rootFixturePath, 'external-indirections');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });

          specify('should apply semantics to eventual external fragment', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const dereferenced = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const fragment = evaluate<Element>(
              dereferenced,
              '/0/components/parameters/externalRef',
            );

            assert.isTrue(isParameterElement(fragment));
          });
        });

        context('given Reference Objects with additional fields', function () {
          const fixturePath = path.join(rootFixturePath, 'additional-fields');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with additional ignored fields', function () {
          const fixturePath = path.join(rootFixturePath, 'additional-ignored-fields');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with internal cycles', function () {
          const fixturePath = path.join(rootFixturePath, 'cycle-internal');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const dereferenced = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const parent = evaluate<Element>(
              dereferenced,
              '/0/components/parameters/param1/examples/example1/examples',
            );
            const cyclicParent = evaluate<Element>(
              dereferenced,
              '/0/components/parameters/param1/examples/example1/examples/example1/examples',
            );

            assert.strictEqual(parent, cyclicParent);
          });
        });

        context('given Reference Objects with external resolution disabled', function () {
          const fixturePath = path.join(rootFixturePath, 'ignore-external');

          specify('should not dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              resolve: { external: false },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with direct circular internal reference', function () {
          const fixturePath = path.join(rootFixturePath, 'direct-internal-circular');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e) {
              assert.instanceOf(e, DereferenceError);
            }
          });
        });

        context('given $ref field with direct circular internal reference to itself', function () {
          const fixturePath = path.join(rootFixturePath, 'direct-self-circular');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e) {
              assert.instanceOf(e, DereferenceError);
            }
          });
        });

        context('given Reference Objects with indirect circular internal reference', function () {
          const fixturePath = path.join(rootFixturePath, 'indirect-internal-circular');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = [loadJsonFile(rootFilePath)];

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with direct circular external reference', function () {
          const fixturePath = path.join(rootFixturePath, 'direct-external-circular');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e) {
              assert.instanceOf(e, DereferenceError);
            }
          });
        });

        context('given Reference Objects with indirect circular external reference', function () {
          const fixturePath = path.join(rootFixturePath, 'indirect-external-circular');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = [loadJsonFile(rootFilePath)];

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with unresolvable reference', function () {
          const fixturePath = path.join(rootFixturePath, 'unresolvable-reference');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e) {
              assert.instanceOf(e, DereferenceError);
            }
          });
        });

        context('given Reference Objects with invalid JSON Pointer', function () {
          const fixturePath = path.join(rootFixturePath, 'invalid-pointer');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e) {
              assert.instanceOf(e, DereferenceError);
            }
          });
        });

        context('given Reference Objects with arbitrary circular references', function () {
          const fixturePath = path.join(rootFixturePath, 'ignore-arbitrary-$refs');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with external circular dependency', function () {
          const fixturePath = path.join(rootFixturePath, 'external-circular-dependency');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects and maxDepth of dereference', function () {
          const fixturePath = path.join(rootFixturePath, 'max-depth');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: { maxDepth: 2 },
              });
              assert.fail('should throw MaximumDereferenceDepthError');
            } catch (error: any) {
              assert.instanceOf(error, DereferenceError);
              // @ts-ignore
              assert.instanceOf(error.cause, MaximumDereferenceDepthError);
              // @ts-ignore
              assert.match(error.cause.message, /fixtures\/max-depth\/ex2.json"$/);
            }
          });
        });

        context('given Reference Objects and maxDepth of resolution', function () {
          const fixturePath = path.join(rootFixturePath, 'max-depth');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { maxDepth: 2 },
              });
              assert.fail('should throw MaximumResolveDepthError');
            } catch (error: any) {
              assert.instanceOf(error, DereferenceError);
              // @ts-ignore
              assert.instanceOf(error.cause, MaximumResolveDepthError);
              // @ts-ignore
              assert.match(error.cause.message, /fixtures\/max-depth\/ex2.json"$/);
            }
          });
        });

        context('given refSet is provided as an option', function () {
          specify('should dereference without external resolution', async function () {
            const fixturePath = path.join(__dirname, 'fixtures', 'refset-as-option');
            const uri = path.join(fixturePath, 'root.json');
            const refSet = await resolve(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const actual = await dereference(uri, {
              dereference: { refSet },
              resolve: { resolvers: [] },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });

          specify('should dereference single ApiDOM fragment', async function () {
            const fixturePath = path.join(__dirname, 'fixtures', 'refset-as-option');
            const uri = path.join(fixturePath, 'root.json');
            const parseResult = await parse(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            // @ts-ignore
            const referenceElement = parseResult.api?.components.parameters.get('externalRef');
            const refSet = new ReferenceSet();
            const rootFileReference = new Reference({ uri, value: parseResult });
            const referenceElementReference = new Reference({
              uri: `${uri}#/single-reference-object`,
              value: new ParseResultElement([referenceElement]),
            });
            // referenceElementReference needs to be added as first to create rootRef
            refSet.add(referenceElementReference).add(rootFileReference);

            const actual = await dereferenceApiDOM(referenceElement, {
              parse: { mediaType: mediaTypes.latest('generic') },
              resolve: { baseURI: uri },
              dereference: { refSet },
            });

            const expected = {
              name: 'externalParameter',
              in: 'query',
              description: 'external ref',
              required: true,
            };

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given path with invalid URL characters - spaces', function () {
          const fixturePath = path.join(rootFixturePath, 'path-encoding', 'path with spaces');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with continueOnError option', function () {
          const fixturePath = path.join(rootFixturePath, 'continue-on-error');

          context('and continueOnError is false (default)', function () {
            specify('should throw on first unresolvable reference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              try {
                await dereference(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                });
                assert.fail('should throw DereferenceError');
              } catch (e) {
                assert.instanceOf(e, DereferenceError);
              }
            });
          });

          context('and continueOnError is true', function () {
            specify('should skip unresolvable references silently', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: { continueOnError: true },
              });

              // working internal $ref should still be dereferenced
              const workingParam = evaluate(actual, '/0/components/parameters/working');
              assert.deepEqual(toValue(workingParam), { type: 'string' });
            });
          });

          context('and continueOnError is a callback function', function () {
            specify('should collect errors via callback', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const errors: Error[] = [];

              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: {
                  continueOnError: (error: Error) => {
                    errors.push(error);
                  },
                },
              });

              assert.lengthOf(errors, 2);
            });

            specify('should produce DereferenceError instances', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const errors: Error[] = [];

              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: {
                  continueOnError: (error: Error) => {
                    errors.push(error);
                  },
                },
              });

              errors.forEach((error) => {
                assert.instanceOf(error, DereferenceError);
              });
            });

            specify('should include structured context on errors', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const errors: Error[] = [];

              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: {
                  continueOnError: (error: Error) => {
                    errors.push(error);
                  },
                },
              });

              const error = errors[0] as any;
              assert.isString(error.uri);
              assert.isString(error.type);
              assert.isString(error.codeFrame);
              assert.isString(error.refFieldName);
              assert.isString(error.refFieldValue);
              assert.isArray(error.trace);
              assert.isDefined(error.cause);
            });

            specify(
              'should still dereference valid references alongside broken ones',
              async function () {
                const rootFilePath = path.join(fixturePath, 'root.json');
                const errors: Error[] = [];

                const actual = await dereference(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                  dereference: {
                    continueOnError: (error: Error) => {
                      errors.push(error);
                    },
                  },
                });

                // working internal $ref should be dereferenced
                const workingParam = evaluate(actual, '/0/components/parameters/working');
                assert.deepEqual(toValue(workingParam), { type: 'string' });

                // broken refs should have produced errors
                assert.lengthOf(errors, 2);
              },
            );
          });

          context('and continueOnError with low maxDepth', function () {
            specify(
              'should not leak indirections across consecutive unresolvable references',
              async function () {
                const rootFilePath = path.join(fixturePath, 'root.json');
                const errors: Error[] = [];

                const actual = await dereference(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                  dereference: {
                    maxDepth: 1,
                    continueOnError: (error: Error) => {
                      errors.push(error);
                    },
                  },
                });

                // errors should be resolve failures, not MaximumDereferenceDepthError
                errors.forEach((error) => {
                  assert.notInstanceOf(error.cause, MaximumDereferenceDepthError);
                });

                // working internal $ref should still resolve despite low maxDepth
                const workingParam = evaluate(actual, '/0/components/parameters/working');
                assert.deepEqual(toValue(workingParam), { type: 'string' });

                assert.lengthOf(errors, 2);
              },
            );
          });

          context('and continueOnError callback throws', function () {
            specify('should stop dereferencing immediately', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const errors: Error[] = [];

              try {
                await dereference(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                  dereference: {
                    continueOnError: (error: Error) => {
                      errors.push(error);
                      throw new Error('abort');
                    },
                  },
                });
                assert.fail('should throw');
              } catch (e: any) {
                assert.instanceOf(e, DereferenceError);
                assert.strictEqual((e as any).cause.message, 'abort');
                assert.lengthOf(errors, 1);
              }
            });
          });
        });
      });
    });
  });
});
