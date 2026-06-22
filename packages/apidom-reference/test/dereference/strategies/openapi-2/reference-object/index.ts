import path from 'node:path';
import { assert } from 'chai';
import { Element } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { isParameterElement, mediaTypes } from '@speclynx/apidom-ns-openapi-2';
import { evaluate } from '@speclynx/apidom-json-pointer';
import { fileURLToPath } from 'node:url';

import { loadJsonFile } from '../../../../helpers.ts';
import { parse, dereference, Reference, ReferenceSet } from '../../../../../src/index.ts';
import DereferenceError from '../../../../../src/errors/DereferenceError.ts';
import UnresolvableReferenceError from '../../../../../src/errors/UnresolvableReferenceError.ts';
import MaximumDereferenceDepthError from '../../../../../src/errors/MaximumDereferenceDepthError.ts';
import MaximumResolveDepthError from '../../../../../src/errors/MaximumResolveDepthError.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entryFixturePath = path.join(__dirname, 'fixtures');

describe('dereference', function () {
  context('strategies', function () {
    context('openapi-2', function () {
      context('Reference Object', function () {
        context('given Reference Objects pointing internally and externally', function () {
          const fixturePath = path.join(entryFixturePath, 'internal-external');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });

          specify('should apply semantics to external fragment', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const dereferenced = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const fragment = evaluate<Element>(dereferenced, '/0/paths/~1/parameters/1');

            assert.isTrue(isParameterElement(fragment));
          });

          specify(
            'should annotate transcluded element with additional metadata',
            async function () {
              const entryFilePath = path.join(fixturePath, 'entry.json');
              const dereferenced = await dereference(entryFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const fragment = evaluate<Element>(dereferenced, '/0/paths/~1/parameters/0');

              assert.strictEqual(
                (fragment.meta.get('ref-fields') as Record<string, unknown>)['$ref'],
                '#/parameters/userIdRef',
              );
            },
          );
        });

        context('given Reference Objects pointing internally only', function () {
          const fixturePath = path.join(entryFixturePath, 'internal-only');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects pointing externally only', function () {
          const fixturePath = path.join(entryFixturePath, 'external-only');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects pointing to external indirections', function () {
          const fixturePath = path.join(entryFixturePath, 'external-indirections');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });

          specify('should apply semantics to eventual external fragment', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const dereferenced = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const fragment = evaluate<Element>(dereferenced, '/0/paths/~1/parameters/0');

            assert.isTrue(isParameterElement(fragment));
          });
        });

        context('given Reference Objects with additional ignored fields', function () {
          const fixturePath = path.join(entryFixturePath, 'additional-ignored-fields');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with external resolution disabled', function () {
          const fixturePath = path.join(entryFixturePath, 'ignore-external');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              resolve: { external: false },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with direct circular internal reference', function () {
          const fixturePath = path.join(entryFixturePath, 'direct-internal-circular');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = [loadJsonFile(entryFilePath)];

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given $ref field with direct circular internal reference to itself', function () {
          const fixturePath = path.join(entryFixturePath, 'direct-self-circular');

          specify('should throw error', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');

            try {
              await dereference(entryFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e) {
              assert.instanceOf(e, UnresolvableReferenceError);
            }
          });
        });

        context('given Reference Objects with indirect circular internal reference', function () {
          const fixturePath = path.join(entryFixturePath, 'indirect-internal-circular');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = [loadJsonFile(entryFilePath)];

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with direct circular external reference', function () {
          const fixturePath = path.join(entryFixturePath, 'direct-external-circular');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = [loadJsonFile(entryFilePath)];

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with indirect circular external reference', function () {
          const fixturePath = path.join(entryFixturePath, 'indirect-external-circular');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = [loadJsonFile(entryFilePath)];

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with unresolvable reference', function () {
          const fixturePath = path.join(entryFixturePath, 'unresolvable-reference');

          specify('should throw error', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            try {
              await dereference(entryFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e) {
              assert.instanceOf(e, UnresolvableReferenceError);
            }
          });
        });

        context('given Reference Objects with invalid JSON Pointer', function () {
          const fixturePath = path.join(entryFixturePath, 'invalid-pointer');

          specify('should throw error', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            try {
              await dereference(entryFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e) {
              assert.instanceOf(e, UnresolvableReferenceError);
            }
          });
        });

        context('given Reference Objects with arbitrary circular references', function () {
          const fixturePath = path.join(entryFixturePath, 'ignore-arbitrary-$refs');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with external circular dependency', function () {
          const fixturePath = path.join(entryFixturePath, 'external-circular-dependency');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects and maxDepth of dereference', function () {
          const fixturePath = path.join(entryFixturePath, 'max-depth');

          specify('should throw error', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');

            try {
              await dereference(entryFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: { maxDepth: 2 },
              });
              assert.fail('should throw MaximumDereferenceDepthError');
            } catch (error: any) {
              assert.instanceOf(error, UnresolvableReferenceError);
              // @ts-ignore
              assert.instanceOf(error.cause, MaximumDereferenceDepthError);
              // @ts-ignore
              assert.match(error.cause.message, /fixtures\/max-depth\/ex2.json"$/);
            }
          });
        });

        context('given Reference Objects and maxDepth of resolution', function () {
          const fixturePath = path.join(entryFixturePath, 'max-depth');

          specify('should throw error', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');

            try {
              await dereference(entryFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { maxDepth: 2 },
              });
              assert.fail('should throw MaximumResolverDepthError');
            } catch (error: any) {
              assert.instanceOf(error, UnresolvableReferenceError);
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

            const entryURI = path.join(fixturePath, 'entry.json');
            const entryParseResult = await parse(entryURI, {
              mediaType: mediaTypes.latest('json'),
            });
            const entryRef = new Reference({ uri: entryURI, value: entryParseResult });

            const ex1URI = path.join(fixturePath, 'ex1.json');
            const ex1ParseResult = await parse(ex1URI, { mediaType: 'application/json' });
            const ex1Ref = new Reference({ uri: ex1URI, value: ex1ParseResult });

            const ex2URI = path.join(fixturePath, 'ex2.json');
            const ex2ParseResult = await parse(ex2URI, { mediaType: 'application/json' });
            const ex2Ref = new Reference({ uri: ex2URI, value: ex2ParseResult });

            const ex3URI = path.join(fixturePath, 'ex3.json');
            const ex3ParseResult = await parse(ex3URI, { mediaType: 'application/json' });
            const ex3Ref = new Reference({ uri: ex3URI, value: ex3ParseResult });

            const refSet = new ReferenceSet({ refs: [entryRef, ex1Ref, ex2Ref, ex3Ref] });

            const actual = await dereference(entryURI, {
              dereference: { refSet },
              resolve: { resolvers: [] },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given path with invalid URL characters - spaces', function () {
          const fixturePath = path.join(entryFixturePath, 'path-encoding', 'path with spaces');

          specify('should dereference', async function () {
            const entryFilePath = path.join(fixturePath, 'entry.json');
            const actual = await dereference(entryFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reference Objects with continueOnError option', function () {
          const fixturePath = path.join(entryFixturePath, 'continue-on-error');

          context('and continueOnError is false (default)', function () {
            specify('should throw on first unresolvable reference', async function () {
              const entryFilePath = path.join(fixturePath, 'entry.json');
              try {
                await dereference(entryFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                });
                assert.fail('should throw DereferenceError');
              } catch (e) {
                assert.instanceOf(e, UnresolvableReferenceError);
              }
            });
          });

          context('and continueOnError is true', function () {
            specify('should skip unresolvable references silently', async function () {
              const entryFilePath = path.join(fixturePath, 'entry.json');
              const actual = await dereference(entryFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: { continueOnError: true },
              });

              // working definition should still be present
              const working = evaluate(actual, '/0/definitions/Working');
              assert.deepEqual(toValue(working), { type: 'string' });
            });
          });

          context('and continueOnError is a callback function', function () {
            specify('should collect errors via callback', async function () {
              const entryFilePath = path.join(fixturePath, 'entry.json');
              const errors: Error[] = [];

              await dereference(entryFilePath, {
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
              const entryFilePath = path.join(fixturePath, 'entry.json');
              const errors: Error[] = [];

              await dereference(entryFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: {
                  continueOnError: (error: Error) => {
                    errors.push(error);
                  },
                },
              });

              errors.forEach((error) => {
                assert.instanceOf(error, UnresolvableReferenceError);
              });
            });

            specify('should include structured context on errors', async function () {
              const entryFilePath = path.join(fixturePath, 'entry.json');
              const errors: Error[] = [];

              await dereference(entryFilePath, {
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
                const entryFilePath = path.join(fixturePath, 'entry.json');
                const errors: Error[] = [];

                const actual = await dereference(entryFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                  dereference: {
                    continueOnError: (error: Error) => {
                      errors.push(error);
                    },
                  },
                });

                // working definition should still be present
                const working = evaluate(actual, '/0/definitions/Working');
                assert.deepEqual(toValue(working), { type: 'string' });

                // broken refs should have produced errors
                assert.lengthOf(errors, 2);
              },
            );
          });

          context('and continueOnError callback throws', function () {
            specify('should stop dereferencing immediately', async function () {
              const entryFilePath = path.join(fixturePath, 'entry.json');
              const errors: Error[] = [];

              try {
                await dereference(entryFilePath, {
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
