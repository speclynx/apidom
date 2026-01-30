import path from 'node:path';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { isJSONSchemaElement, mediaTypes } from '@speclynx/apidom-ns-arazzo-1';
import { evaluate } from '@speclynx/apidom-json-pointer';
import { fileURLToPath } from 'node:url';

import { dereference, parse, Reference, ReferenceSet } from '../../../../../src/index.ts';
import { loadJsonFile } from '../../../../helpers.ts';
import DereferenceError from '../../../../../src/errors/DereferenceError.ts';
import MaximumDereferenceDepthError from '../../../../../src/errors/MaximumDereferenceDepthError.ts';
import MaximumResolveDepthError from '../../../../../src/errors/MaximumResolveDepthError.ts';
import EvaluationJsonSchema$anchorError from '../../../../../src/errors/EvaluationJsonSchema$anchorError.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('dereference', function () {
  context('strategies', function () {
    context('arazzo-1', function () {
      context('JSONSchemaElement - $ref keyword', function () {
        context('given JSON Schema Objects pointing internally only', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-only');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });

          specify('should apply semantics to dereferenced element', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const dereferenced = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const fragment = evaluate(dereferenced, '/0/components/inputs/WorkflowInput');

            assert.isTrue(isJSONSchemaElement(fragment));
          });
        });

        context('given JSON Schema Objects pointing externally only', function () {
          const fixturePath = path.join(rootFixturePath, 'external-only');

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
            const fragment = evaluate(dereferenced, '/0/components/inputs/User/properties/profile');

            assert.isTrue(isJSONSchemaElement(fragment));
          });
        });

        context('given JSON Schema Objects with internal cycles', function () {
          const fixturePath = path.join(rootFixturePath, 'cycle-internal');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const dereferenced = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const parent = evaluate(
              dereferenced,
              '/0/components/inputs/User/properties/parent/properties/parent',
            );
            const cyclicParent = evaluate(
              dereferenced,
              '/0/components/inputs/User/properties/parent/properties/parent/properties/parent/properties/parent',
            );

            assert.strictEqual(parent, cyclicParent);
          });
        });

        context('given Boolean JSON Schemas', function () {
          const fixturePath = path.join(rootFixturePath, 'boolean-json-schema');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given JSON Schema Objects pointing to internal indirections', function () {
          const fixturePath = path.join(rootFixturePath, 'indirect-internal');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given JSON Schema Objects pointing to external indirections', function () {
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
            const fragment = evaluate(dereferenced, '/0/components/inputs/Indirection');

            assert.isTrue(isJSONSchemaElement(fragment));
          });
        });

        context('given JSON Schema Objects with external cycles', function () {
          const fixturePath = path.join(rootFixturePath, 'cycle-external');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const dereferenced = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const parent = evaluate(
              dereferenced,
              '/0/components/inputs/User/properties/profile/properties/parent/properties/parent',
            );
            const cyclicParent = evaluate(
              dereferenced,
              '/0/components/inputs/User/properties/profile/properties/parent/properties/parent/properties/parent',
            );

            assert.strictEqual(parent, cyclicParent);
          });
        });

        context('given JSON Schema Objects with overlapping keywords', function () {
          const fixturePath = path.join(rootFixturePath, 'merging-keywords');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given JSON Schema Objects and target depth of dereference', function () {
          const fixturePath = path.join(rootFixturePath, 'max-depth');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: { maxDepth: 2 },
              });
              assert.fail('should throw MaximumDereferenceDepthError');
            } catch (error: unknown) {
              assert.instanceOf(error, DereferenceError);
              // @ts-ignore
              assert.instanceOf(error.cause.cause, MaximumDereferenceDepthError);
            }
          });
        });

        context('given JSON Schema Objects and maxDepth of resolution', function () {
          const fixturePath = path.join(rootFixturePath, 'max-depth');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { maxDepth: 2 },
              });
              assert.fail('should throw MaximumResolveDepthError');
            } catch (error: unknown) {
              assert.instanceOf(error, DereferenceError);
              // @ts-ignore
              assert.instanceOf(error.cause.cause, MaximumResolveDepthError);
            }
          });
        });

        context('given JSON Schema Objects with unresolvable reference', function () {
          const fixturePath = path.join(rootFixturePath, 'unresolvable-reference');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e: unknown) {
              assert.instanceOf(e, DereferenceError);
            }
          });
        });

        context('given JSON Schema Objects with invalid JSON Pointer', function () {
          const fixturePath = path.join(rootFixturePath, 'invalid-pointer');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e: unknown) {
              assert.instanceOf(e, DereferenceError);
            }
          });
        });

        context('given JSON Schema Objects pointing internally and externally', function () {
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
            const fragment = evaluate(dereferenced, '/0/components/inputs/Order');

            assert.isTrue(isJSONSchemaElement(fragment));
          });
        });

        context('given JSON Schema Objects with external resolution disabled', function () {
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

        context('given JSON Schema Objects with advanced internal cycles', function () {
          const fixturePath = path.join(rootFixturePath, 'cycle-internal-advanced');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const dereferenced = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            // Verify that the PlatformMenuTree references correctly
            const treeNode = evaluate(dereferenced, '/0/components/inputs/PlatformMenuTreeNode');
            // The tree is resolved and has properties
            assert.isTrue(isJSONSchemaElement(treeNode));
          });
        });

        context('given JSON Schema Objects with direct circular internal reference', function () {
          const fixturePath = path.join(rootFixturePath, 'direct-internal-circular');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e: unknown) {
              assert.instanceOf(e, DereferenceError);
            }
          });
        });

        context('given JSON Schema Objects with direct circular external reference', function () {
          const fixturePath = path.join(rootFixturePath, 'direct-external-circular');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given JSON Schema Objects with indirect circular internal reference', function () {
          const fixturePath = path.join(rootFixturePath, 'indirect-internal-circular');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given JSON Schema Objects with indirect circular external reference', function () {
          const fixturePath = path.join(rootFixturePath, 'indirect-external-circular');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given JSON Schema Objects with external circular dependency', function () {
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

        context('given JSON Schema Objects with infinite recursion', function () {
          const fixturePath = path.join(rootFixturePath, 'infinite-recursion');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context(
          'given JSON Schema Objects with $anchor keyword pointing to internal schema',
          function () {
            const fixturePath = path.join(rootFixturePath, '$anchor-internal');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context(
          'given JSON Schema Objects with $anchor keyword pointing to external schema',
          function () {
            const fixturePath = path.join(rootFixturePath, '$anchor-external');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context('given JSON Schema Objects with not found $anchor', function () {
          const fixturePath = path.join(rootFixturePath, '$anchor-not-found');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (error: unknown) {
              assert.instanceOf(error, DereferenceError);
              // @ts-ignore
              assert.instanceOf(error.cause.cause, EvaluationJsonSchema$anchorError);
            }
          });
        });

        context('given JSON Schema Objects with internal and external cycles', function () {
          const fixturePath = path.join(rootFixturePath, 'cycle-internal-external');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const dereferenced = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const user = evaluate(
              dereferenced,
              '/0/components/inputs/User/properties/profile/properties/user/properties/profile',
            );
            const cyclicUserInProfile = evaluate(
              dereferenced,
              '/0/components/inputs/User/properties/profile/properties/user/properties/profile/properties/user/properties/profile',
            );

            assert.strictEqual(user, cyclicUserInProfile);
          });
        });

        context('given JSON Schema Objects with internal cycles in array', function () {
          const fixturePath = path.join(rootFixturePath, 'cycle-internal-in-array');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const dereferenced = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const parent = evaluate(dereferenced, '/0/components/inputs/User/properties/parent');
            const cyclicParent = evaluate(
              dereferenced,
              '/0/components/inputs/User/properties/parent/oneOf/0/properties/parent',
            );

            assert.strictEqual(parent, cyclicParent);
          });
        });

        context(
          'given JSON Schema Objects with $id keyword defined directly in referencing Schema Object',
          function () {
            const fixturePath = path.join(rootFixturePath, '$id-uri-direct');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context(
          'given JSON Schema Objects with $ref keyword containing URL and JSON Pointer fragment',
          function () {
            const fixturePath = path.join(rootFixturePath, '$ref-url-pointer');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context('given JSON Schema Objects with $anchor keyword and no embedding', function () {
          const fixturePath = path.join(rootFixturePath, '$anchor-internal-no-embedding');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given JSON Schema Objects with unresolvable $id', function () {
          const fixturePath = path.join(rootFixturePath, '$id-unresolvable');

          specify('should throw error', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw DereferenceError');
            } catch (e: unknown) {
              assert.instanceOf(e, DereferenceError);
            }
          });
        });

        context(
          'given JSON Schema Objects with $id keyword in enclosing Schema Object',
          function () {
            const fixturePath = path.join(rootFixturePath, '$id-uri-enclosing');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context('given JSON Schema Objects with $id keyword pointing externally', function () {
          const fixturePath = path.join(rootFixturePath, '$id-uri-external');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context(
          'given JSON Schema Objects with $id keyword and external circular structures',
          function () {
            const fixturePath = path.join(rootFixturePath, '$id-uri-external-circular-structures');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const dereferenced = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const fragment = evaluate(dereferenced, '/0/components/inputs/User');

              assert.isTrue(isJSONSchemaElement(fragment));
            });
          },
        );

        context('given JSON Schema Objects with $ref keyword containing URL', function () {
          const fixturePath = path.join(rootFixturePath, '$ref-url');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context(
          'given JSON Schema Objects with $ref keyword containing URL and $anchor fragment',
          function () {
            const fixturePath = path.join(rootFixturePath, '$ref-url-$anchor');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context(
          'given JSON Schema Objects with $ref keyword containing URL and path override',
          function () {
            const fixturePath = path.join(rootFixturePath, '$ref-url-path-override');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const parseResult = await parse(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const uri = 'https://example.com/';
              const reference = new Reference({ uri, value: parseResult });
              const refSet = new ReferenceSet({ refs: [reference] });
              const actual = await dereference(uri, {
                dereference: { refSet },
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context(
          'given JSON Schema Objects with $ref keyword containing relative reference URL',
          function () {
            const fixturePath = path.join(rootFixturePath, '$ref-url-relative-reference');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context(
          'given JSON Schema Objects with $ref keyword containing resolvable URL',
          function () {
            const fixturePath = path.join(rootFixturePath, '$ref-url-resolvable');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context(
          'given JSON Schema Objects with $ref keyword containing unresolvable URL',
          function () {
            const fixturePath = path.join(rootFixturePath, '$ref-url-unresolvable');

            specify('should throw error', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');

              try {
                await dereference(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                });
                assert.fail('should throw DereferenceError');
              } catch (e: unknown) {
                assert.instanceOf(e, DereferenceError);
              }
            });
          },
        );

        context('given JSON Schema Objects with $ref keyword containing URN', function () {
          const fixturePath = path.join(rootFixturePath, '$ref-urn');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context(
          'given JSON Schema Objects with $ref keyword containing URN and $anchor fragment',
          function () {
            const fixturePath = path.join(rootFixturePath, '$ref-urn-$anchor');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context(
          'given JSON Schema Objects with $ref keyword containing URN and JSON Pointer fragment',
          function () {
            const fixturePath = path.join(rootFixturePath, '$ref-urn-pointer');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context(
          'given JSON Schema Objects with $ref keyword containing unresolvable URN',
          function () {
            const fixturePath = path.join(rootFixturePath, '$ref-urn-unresolvable');

            specify('should throw error', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');

              try {
                await dereference(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                });
                assert.fail('should throw DereferenceError');
              } catch (e: unknown) {
                assert.instanceOf(e, DereferenceError);
              }
            });
          },
        );

        context('given JSON Schema Objects with $schema keyword defined', function () {
          const fixturePath = path.join(rootFixturePath, '$schema-defined');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context(
          'given JSON Schema Objects with $schema keyword in enclosing Schema Object',
          function () {
            const fixturePath = path.join(rootFixturePath, '$schema-enclosing');

            specify('should dereference', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const actual = await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

              assert.deepEqual(toValue(actual), expected);
            });
          },
        );

        context('given JSON Schema Objects with mixed $schema keywords', function () {
          const fixturePath = path.join(rootFixturePath, '$schema-mixed');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given JSON Schema Objects with undefined $schema keyword', function () {
          const fixturePath = path.join(rootFixturePath, '$schema-undefined');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given JSON Schema Objects with unrecognized $schema keyword', function () {
          const fixturePath = path.join(rootFixturePath, '$schema-unrecognized');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given JSON Schema Objects with various document boundaries', function () {
          const fixturePath = path.join(rootFixturePath, 'document-boundaries');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.yml');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('yaml') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });
      });
    });
  });
});
