import path from 'node:path';
import { assert } from 'chai';
import { Element, cloneShallow, ParseResultElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { isParameterElement, mediaTypes } from '@speclynx/apidom-ns-openapi-2';
import { evaluate } from '@speclynx/apidom-json-pointer';
import { fileURLToPath } from 'node:url';

import { loadJsonFile } from '../../../../helpers.ts';
import {
  parse,
  dereference,
  dereferenceApiDOM,
  Reference,
  ReferenceSet,
} from '../../../../../src/index.ts';
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
        context('given references nested in a referenced fragment', function () {
          specify('should dereference them when dereferencing a fragment', async function () {
            const rootFilePath = path.join(entryFixturePath, 'nested-in-fragment', 'root.json');
            const parseResult = await parse(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const pathItem = evaluate<Element>(parseResult.api!, '/paths/~1a');
            const fragment = cloneShallow(pathItem);
            fragment.classes.push('result');
            const refSet = new ReferenceSet();
            refSet
              .add(
                new Reference({
                  uri: `${rootFilePath}#fragment`,
                  value: new ParseResultElement([fragment]),
                }),
              )
              .add(new Reference({ uri: rootFilePath, value: parseResult }));

            const dereferenced = await dereferenceApiDOM(pathItem, {
              parse: { mediaType: mediaTypes.latest('json') },
              resolve: { baseURI: rootFilePath },
              dereference: { refSet },
            });
            const schema = evaluate<Element>(dereferenced, '/get/responses/200/schema');

            assert.strictEqual(schema.element, 'schema');
            assert.deepEqual(toValue(schema), { type: 'string' });
          });
        });

        context('given Reference Objects sharing components', function () {
          specify('should dereference each shared component once', async function () {
            const rootFilePath = path.join(entryFixturePath, 'shared-schemas', 'root.json');
            const dereferenced = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            let schema = evaluate<Element>(dereferenced, '/0/definitions/S0') as any;

            for (let depth = 0; depth < 19; depth += 1) {
              const a = schema.get('properties').get('a');
              const b = schema.get('properties').get('b');
              assert.strictEqual(a.element, 'schema');
              // both references transclude the same dereferenced schema
              assert.strictEqual(a.get('properties'), b.get('properties'));
              schema = a;
            }
            schema = schema.get('properties').get('a');
            assert.deepEqual(toValue(schema), { type: 'string' });
          });
        });

        context('given a fragment referenced as different types', function () {
          ['parameter-first.json', 'schema-first.json'].forEach((fixture) => {
            specify(`should read it as each expected type (${fixture})`, async function () {
              const rootFilePath = path.join(entryFixturePath, 'type-by-reference', fixture);
              const dereferenced = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const pointers = fixture.startsWith('parameter')
                ? ['/0/paths/~1a/get/parameters/0', '/0/paths/~1b/get/responses/200/schema']
                : ['/0/paths/~1b/get/parameters/0', '/0/paths/~1a/get/responses/200/schema'];

              assert.strictEqual(evaluate<Element>(dereferenced, pointers[0]).element, 'parameter');
              assert.strictEqual(evaluate<Element>(dereferenced, pointers[1]).element, 'schema');
            });
          });
        });

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
