import path from 'node:path';
import { assert } from 'chai';
import sinon from 'sinon';
import { identity } from 'ramda';
import { toValue } from '@speclynx/apidom-core';
import { Element, isRefElement } from '@speclynx/apidom-datamodel';
import { isJSONSchemaElement, isParameterElement, mediaTypes } from '@speclynx/apidom-ns-arazzo-1';
import { evaluate } from '@speclynx/apidom-json-pointer';
import { fileURLToPath } from 'node:url';

import {
  dereference,
  dereferenceApiDOM,
  parse,
  Reference,
  ReferenceSet,
} from '../../../../../src/index.ts';
import { loadJsonFile } from '../../../../helpers.ts';
import { dereferenceWorkflow } from '../helpers.ts';
import * as url from '../../../../../src/util/url.ts';
import DereferenceError from '../../../../../src/errors/DereferenceError.ts';
import UnresolvableReferenceError from '../../../../../src/errors/UnresolvableReferenceError.ts';
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
              assert.instanceOf(error, UnresolvableReferenceError);
              // @ts-ignore
              assert.instanceOf(error.cause, MaximumDereferenceDepthError);
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
              assert.instanceOf(error, UnresolvableReferenceError);
              // @ts-ignore
              assert.instanceOf(error.cause, MaximumResolveDepthError);
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
              assert.instanceOf(e, UnresolvableReferenceError);
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
              assert.instanceOf(e, UnresolvableReferenceError);
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
              assert.instanceOf(e, UnresolvableReferenceError);
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
              assert.instanceOf(error, UnresolvableReferenceError);
              // @ts-ignore
              assert.instanceOf(error.cause, EvaluationJsonSchema$anchorError);
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
              assert.instanceOf(e, UnresolvableReferenceError);
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

        context(
          'given JSON Schema Objects with $id keyword in enclosing Schema Object of external file',
          function () {
            const fixturePath = path.join(rootFixturePath, '$id-uri-enclosing-external');

            // the referenced fragment sits under a $id it doesn't declare itself, so its
            // nested $ref must resolve against that enclosing $id, not the retrieval URI
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
          'given JSON Schema Objects referencing a fragment enclosed by a different $id chain',
          function () {
            const fixturePath = path.join(rootFixturePath, '$id-uri-enclosing-transplant');

            // the referencing schema is visited first and sits under no $id, while the
            // fragment sits under one (and references a schema that sits under none);
            // the $refs inside must resolve against the bases of their own locations
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
          'given single JSONSchemaElement enclosed by $id keyword passed to dereferenceApiDOM',
          function () {
            const fixturePath = path.join(rootFixturePath, '$id-uri-enclosing');

            // the fragment is detached from the document, so the enclosing $id is
            // only known through the refraction-time metadata
            specify('should resolve $ref against the enclosing $id', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const parseResult = await parse(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const schemaElement = evaluate<Element>(
                parseResult.api,
                '/components/inputs/User/properties/profile',
              );
              const dereferenced = await dereferenceApiDOM(schemaElement, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { baseURI: rootFilePath },
              });

              assert.deepEqual(toValue(dereferenced), {
                type: 'object',
                properties: { avatar: { type: 'string' } },
              });
            });
          },
        );

        context(
          'given single JSONSchemaElement with relative $id enclosed by $id keyword passed to dereferenceApiDOM',
          function () {
            const fixturePath = path.join(rootFixturePath, '$id-uri-enclosing-relative');

            // the fragment's own $id resolves against the enclosing $id known only
            // through the refraction-time metadata; the $ref resolves against that
            specify('should resolve $ref within the fragment $id resource', async function () {
              const rootFilePath = path.join(fixturePath, 'root.json');
              const parseResult = await parse(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const schemaElement = evaluate<Element>(
                parseResult.api,
                '/components/inputs/Root/$defs/Identified',
              );
              const dereferenced = await dereferenceApiDOM(schemaElement, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { baseURI: rootFilePath },
              });

              assert.deepEqual(toValue(dereferenced), {
                type: 'integer',
                $id: 'identified',
                $defs: { Inner: { type: 'integer' } },
              });
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

        context('given Arazzo Object with $self keyword', function () {
          const fixturePath = path.join(rootFixturePath, '$self-base-uri');
          const rootFilePath = path.join(fixturePath, 'root.json');
          let refSet: ReferenceSet;
          let actual: Element;

          beforeEach(async function () {
            refSet = new ReferenceSet();
            actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: { refSet },
            });
          });

          afterEach(function () {
            refSet.clean();
          });

          specify('should resolve relative $ref against $self base URI', function () {
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });

          specify('should resolve reference to $self by identity', function () {
            const uris = refSet.refs.map((ref) => ref.uri);

            // entry document is registered by its retrieval URI only, not by $self
            assert.strictEqual(uris.length, 2);
            assert.include(uris, url.fromFileSystemPath(rootFilePath));
            assert.include(
              uris,
              url.fromFileSystemPath(path.join(fixturePath, 'nested', 'ex.json')),
            );
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
                assert.instanceOf(e, UnresolvableReferenceError);
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
                assert.instanceOf(e, UnresolvableReferenceError);
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

        context('given cycles of JSON Schema Objects', function () {
          const rootFilePath = path.join(rootFixturePath, 'cycle-modes', 'root.json');
          const dereferenceDocument = async (dereferenceOptions: Record<string, unknown> = {}) => {
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: dereferenceOptions,
            });
            return (actual.api as any).workflows.get(0);
          };
          const assertCycles = (workflow: any) => {
            const self = workflow.inputs.properties.get('self');
            const ping = workflow.inputs.properties.get('ping');
            const pong = ping.properties.get('next');

            assert.isTrue(isJSONSchemaElement(self));
            assert.strictEqual(self.properties.get('next').properties, self.properties);
            assert.isTrue(isJSONSchemaElement(pong));
            assert.strictEqual(pong.properties.get('next').properties, ping.properties);
          };
          const assertReplacements = (workflow: any) => {
            const selfRef = workflow.inputs.properties.get('self').properties.get('next');
            const pong = workflow.inputs.properties.get('ping').properties.get('next');
            const pingRef = pong.properties.get('next');

            assert.isTrue(isRefElement(selfRef));
            assert.isTrue((toValue(selfRef) as string).endsWith('#/components/inputs/self'));
            assert.strictEqual(toValue(selfRef.meta.get('$ref')), '#/components/inputs/self');
            assert.strictEqual(toValue(selfRef.meta.get('type')), 'JSONSchema');
            assert.isTrue(isJSONSchemaElement(pong));
            assert.isTrue(isRefElement(pingRef));
            assert.strictEqual(toValue(pingRef.meta.get('$ref')), '#/components/inputs/ping');
          };

          context('given circular=ignore', function () {
            specify('should dereference and create cycles', async function () {
              const workflow = await dereferenceDocument({ circular: 'ignore' });

              assertCycles(workflow);
              assert.throws(() => JSON.stringify(toValue(workflow)));
            });

            specify(
              'should dereference and create cycles when dereferencing a Workflow fragment',
              async function () {
                assertCycles(await dereferenceWorkflow(rootFilePath, 0));
              },
            );
          });

          context('given circular=replace', function () {
            specify('should dereference and eliminate all cycles', async function () {
              const workflow = await dereferenceDocument({ circular: 'replace' });

              assertReplacements(workflow);
              assert.doesNotThrow(() => JSON.stringify(toValue(workflow)));
            });

            specify(
              'should dereference and eliminate all cycles when dereferencing a Workflow fragment',
              async function () {
                const workflow = await dereferenceWorkflow(rootFilePath, 0, {
                  dereference: { circular: 'replace' },
                });

                assertReplacements(workflow);
                assert.doesNotThrow(() => JSON.stringify(toValue(workflow)));
              },
            );

            specify('should mark the ReferenceSet as circular', async function () {
              const refSet = new ReferenceSet();
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: { circular: 'replace', refSet },
              });

              assert.isTrue(refSet.circular);
            });
          });

          context('given circular=replace and custom replacer is provided', function () {
            specify('should dereference and eliminate all cycles', async function () {
              const circularReplacer = sinon.spy(identity);

              await dereferenceDocument({ circular: 'replace', circularReplacer });

              assert.strictEqual(circularReplacer.callCount, 2);
              circularReplacer.getCalls().forEach((call) => {
                assert.isTrue(isRefElement(call.args[0]));
                assert.isTrue(isRefElement(call.returnValue));
              });
            });

            specify('should prefer arazzo-1 strategy specific replacer', async function () {
              const circularReplacer = sinon.spy(identity);
              const strategyCircularReplacer = sinon.spy(identity);

              await dereferenceDocument({
                circular: 'replace',
                circularReplacer,
                strategyOpts: { 'arazzo-1': { circularReplacer: strategyCircularReplacer } },
              });

              assert.isTrue(circularReplacer.notCalled);
              assert.strictEqual(strategyCircularReplacer.callCount, 2);
            });
          });

          context('given circular=error', function () {
            specify('should dereference and throw on first detected cycle', async function () {
              try {
                await dereferenceDocument({ circular: 'error' });
                assert.fail('should throw UnresolvableReferenceError');
              } catch (error: any) {
                assert.instanceOf(error, UnresolvableReferenceError);
                assert.strictEqual((error.cause as Error).message, 'Circular reference detected');
              }
            });

            specify(
              'should throw on first detected cycle when dereferencing a Workflow fragment',
              async function () {
                try {
                  await dereferenceWorkflow(rootFilePath, 0, {
                    dereference: { circular: 'error' },
                  });
                  assert.fail('should throw UnresolvableReferenceError');
                } catch (error: any) {
                  assert.instanceOf(error, UnresolvableReferenceError);
                  assert.strictEqual((error.cause as Error).message, 'Circular reference detected');
                }
              },
            );

            specify('should report each cycle once when continueOnError is set', async function () {
              const errors: UnresolvableReferenceError[] = [];
              await dereferenceDocument({
                circular: 'error',
                continueOnError: (error: UnresolvableReferenceError) => errors.push(error),
              });

              assert.deepEqual(
                errors.map((error: any) => [error.refFieldValue, error.location]),
                [
                  ['#/components/inputs/self', '/components/inputs/self/properties/next'],
                  ['#/components/inputs/ping', '/components/inputs/pong/properties/next'],
                ],
              );
            });
          });
        });

        context('given JSON Schema Objects dereferenced in several runs', function () {
          const rootFilePath = path.join(rootFixturePath, 'cross-run', 'root.json');

          specify('should not carry a dereference run over to the next one', async function () {
            const parseResult = await parse(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            await dereferenceWorkflow(rootFilePath, 0, {
              parseResult,
              dereference: { circular: 'replace', immutable: false },
            });
            const second = await dereferenceWorkflow(rootFilePath, 1, {
              parseResult,
              dereference: { circular: 'ignore', immutable: false },
            });
            const { inputs } = second;

            assert.isFalse(isRefElement(inputs.properties.get('next')));
            assert.strictEqual(inputs.properties.get('next').properties, inputs.properties);
          });
        });

        context('given cycle of JSON Schema Objects referenced from several places', function () {
          const fixturePath = path.join(rootFixturePath, 'cycle-orders');

          ['workflows-first.json', 'components-first.json'].forEach((fixture) => {
            context(`given ${fixture}`, function () {
              const rootFilePath = path.join(fixturePath, fixture);

              specify('should report the cycle once when circular=error', async function () {
                const errors: UnresolvableReferenceError[] = [];
                await dereference(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                  dereference: {
                    circular: 'error',
                    continueOnError: (error: UnresolvableReferenceError) => errors.push(error),
                  },
                });

                assert.lengthOf(errors, 1);
                assert.strictEqual(
                  (errors[0].cause as Error).message,
                  'Circular reference detected',
                );
              });

              specify('should eliminate all cycles when circular=replace', async function () {
                const actual = await dereference(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                  dereference: { circular: 'replace' },
                });

                assert.doesNotThrow(() => JSON.stringify(toValue(actual)));
              });

              [0, 1, 2].forEach((index) => {
                specify(
                  `should detect the cycle when dereferencing Workflow fragment #${index}`,
                  async function () {
                    const workflow = await dereferenceWorkflow(rootFilePath, index, {
                      dereference: { circular: 'replace' },
                    });

                    assert.doesNotThrow(() => JSON.stringify(toValue(workflow)));

                    try {
                      await dereferenceWorkflow(rootFilePath, index, {
                        dereference: { circular: 'error' },
                      });
                      assert.fail('should throw UnresolvableReferenceError');
                    } catch (error: any) {
                      assert.instanceOf(error, UnresolvableReferenceError);
                      assert.strictEqual(
                        (error.cause as Error).message,
                        'Circular reference detected',
                      );
                    }
                  },
                );
              });
            });
          });
        });

        context('given JSON Schema Objects sharing referenced schemas', function () {
          const rootFilePath = path.join(rootFixturePath, 'diamond', 'root.json');
          const assertDereferenced = (schema: any) => {
            for (let depth = 0; depth < 20; depth += 1) {
              assert.isTrue(isJSONSchemaElement(schema));
              assert.isTrue(isJSONSchemaElement(schema.properties.get('y')));
              // both references transclude the same dereferenced schema
              assert.strictEqual(
                schema.properties.get('x').properties,
                schema.properties.get('y').properties,
              );
              schema = schema.properties.get('x');
            }
            assert.strictEqual(toValue(schema.type), 'string');
          };

          specify('should dereference each shared schema once', async function () {
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assertDereferenced((actual.api as any).workflows.get(0).inputs);
          });

          specify(
            'should dereference each shared schema once when dereferencing a Workflow fragment',
            async function () {
              const workflow = await dereferenceWorkflow(rootFilePath, 0);

              assertDereferenced(workflow.inputs);
            },
          );
        });

        context('given JSON Schema Objects sharing a target and maxDepth', function () {
          const rootFilePath = path.join(rootFixturePath, 'max-depth-shared', 'root.json');

          [0, 1].forEach((index) => {
            specify(
              `should exceed maxDepth whichever reference reaches the shared target first (#${index})`,
              async function () {
                try {
                  await dereferenceWorkflow(rootFilePath, index, { dereference: { maxDepth: 2 } });
                  assert.fail('should throw UnresolvableReferenceError');
                } catch (error: any) {
                  assert.instanceOf(error, UnresolvableReferenceError);
                  assert.instanceOf(error.cause, MaximumDereferenceDepthError);
                }
              },
            );
          });

          specify('should not exceed maxDepth that the deepest chain fits', async function () {
            const workflow = await dereferenceWorkflow(rootFilePath, 0, {
              dereference: { maxDepth: 3 },
            });

            assert.strictEqual(
              toValue(
                workflow.inputs.properties.get('deep').properties.get('x').properties.get('y').type,
              ),
              'string',
            );
          });
        });

        context(
          'given unresolvable JSON Schema Object in an element read as JSON Schema',
          function () {
            const rootFilePath = path.join(
              rootFixturePath,
              'typed-target-unresolvable',
              'root.json',
            );

            specify('should report the location within the document', async function () {
              const errors: UnresolvableReferenceError[] = [];
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: {
                  continueOnError: (error: UnresolvableReferenceError) => errors.push(error),
                },
              });

              assert.deepEqual(
                errors.map((error: any) => [error.refFieldValue, error.location]),
                [['#/components/inputs/missing', '/components/parameters/status/properties/k']],
              );
            });
          },
        );

        context('given JSON Schema Objects referencing an external schema that fails', function () {
          const rootFilePath = path.join(rootFixturePath, 'external-unresolvable', 'root.json');

          specify('should report the failure for every referencing element', async function () {
            const errors: UnresolvableReferenceError[] = [];
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                continueOnError: (error: UnresolvableReferenceError) => errors.push(error),
              },
            });
            const { properties } = (actual.api as any).workflows.get(0).inputs;

            // the failure originates within the external document, the trace leads to it
            assert.deepEqual(
              errors.map((error: any) => [error.location, error.trace[0].location]),
              [
                ['/$defs/T/properties/k', '/workflows/0/inputs/properties/first'],
                ['/$defs/T/properties/k', '/workflows/0/inputs/properties/second'],
              ],
            );
            assert.strictEqual(toValue(properties.get('first').$ref), './ex.json#/$defs/T');
            assert.strictEqual(toValue(properties.get('second').$ref), './ex.json#/$defs/T');
          });
        });

        context('given JSON Schema Objects referencing elements of another type', function () {
          const rootFilePath = path.join(rootFixturePath, 'typed-target', 'root.json');

          specify('should read the referenced element as JSON Schema', async function () {
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const { workflows, components } = actual.api as any;
            const plain = workflows.get(0).inputs.properties.get('plain');
            const annotated = workflows.get(0).inputs.properties.get('annotated');

            assert.isTrue(isJSONSchemaElement(plain));
            assert.deepEqual(toValue(plain), {
              name: 'status',
              in: 'query',
              value: 'from-component',
            });
            assert.deepEqual(toValue(plain.meta.get('ref-fields')), {
              $ref: '#/components/parameters/status',
            });
            assert.isTrue(isJSONSchemaElement(annotated));
            assert.strictEqual(toValue(annotated.description), 'override');
            assert.isTrue(isParameterElement(workflows.get(0).steps.get(0).parameters.get(0)));
            assert.isTrue(isParameterElement(components.parameters.get('status')));
          });
        });

        context('given component dereferenced both as itself and as JSON Schema', function () {
          const fixturePath = path.join(rootFixturePath, 'typed-order');
          const workflowOf = (actual: any, workflowId: string) =>
            (actual.api.workflows.content as any[]).find(
              (workflow) => toValue(workflow.workflowId) === workflowId,
            );

          specify('should not depend on which reference is reached first', async function () {
            const results = await Promise.all(
              ['reusable-first.json', 'schema-first.json'].map((fixture) =>
                dereference(path.join(fixturePath, fixture), {
                  parse: { mediaType: mediaTypes.latest('json') },
                }),
              ),
            );

            results.forEach((actual) => {
              const asSchema = workflowOf(actual, 'by-schema').inputs;
              const asAction = workflowOf(actual, 'by-reusable').steps.get(0).onSuccess.get(0);

              assert.isTrue(isJSONSchemaElement(asSchema));
              assert.deepEqual(toValue(asSchema), {
                name: 'jump',
                type: 'goto',
                workflowId: 'target',
                parameters: [{ name: 'status', in: 'query', value: 'from-jump' }],
              });
              assert.isTrue(isParameterElement(asAction.parameters.get(0)));
              assert.strictEqual(toValue(asAction.parameters.get(0).value), 'from-jump');
            });
          });
        });

        context('given JSON Schema Objects with continueOnError option', function () {
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
                assert.instanceOf(e, UnresolvableReferenceError);
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

              const working = evaluate(actual, '/0/components/inputs/Working');
              assert.deepEqual(toValue(working), { type: 'string' });
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
                assert.instanceOf(error, UnresolvableReferenceError);
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
