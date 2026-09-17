import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import {
  Element,
  ParseResultElement,
  includesClasses,
  isParseResultElement,
} from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-arazzo-1';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle, dereference } from '../../../../../src/index.ts';
import * as url from '../../../../../src/util/url.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('arazzo-1', function () {
      context('JSON Schema Object', function () {
        context('given external Schema Object referenced by JSON Pointer', function () {
          const fixturePath = path.join(rootFixturePath, 'external-pointer');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should produce a ParseResultElement', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.isTrue(isParseResultElement(bundled));
          });

          specify('should embed the whole external schema resource', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const inputs = toValue(
              evaluate(bundled.result as Element, '/components/inputs'),
            ) as Record<string, object>;

            assert.containsAllKeys(inputs, ['pets']);
            assert.deepEqual(inputs.pets, {
              $id: 'https://example.com/schemas/pets',
              $schema: 'https://json-schema.org/draft/2020-12/schema',
              $defs: {
                Pet: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                    },
                  },
                },
              },
            });
          });

          specify('should produce a components-inputs named-content element', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const inputs = evaluate<Element>(bundled.result as Element, '/components/inputs');

            assert.isTrue(includesClasses(inputs, ['components-inputs']));
          });

          specify('should rebase the referencing $ref onto the resource $id', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/components/inputs/User/properties/pet/$ref'),
              ),
              'https://example.com/schemas/pets#/$defs/Pet',
            );
          });

          specify('should annotate the embedded resource with its origin', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const embedded = evaluate<Element>(
              bundled.result as Element,
              '/components/inputs/pets',
            );

            assert.match(toValue(embedded.meta.get('ref-origin')) as string, /ex\.json$/);
          });
        });

        context('given external Schema Object referenced by absolute $id URI', function () {
          const fixturePath = path.join(rootFixturePath, 'external-id-uri');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should embed the resource and rebase the $ref onto its $id', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/inputs/pet/$id')),
              'https://example.com/schemas/pet',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/inputs/Pet/$ref')),
              'https://example.com/schemas/pet',
            );
          });
        });

        context('given external Schema Object referenced by $anchor', function () {
          const fixturePath = path.join(rootFixturePath, 'external-anchor');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should embed the resource carrying the anchor', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/inputs/user/$defs/UserProfile/$anchor',
                ),
              ),
              'user-profile',
            );
          });

          specify('should rebase the $anchor reference onto the resource $id', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/inputs/User/properties/profile/$ref',
                ),
              ),
              'https://example.com/schemas/user#user-profile',
            );
          });
        });

        context('given external Schema Object using $dynamicRef and $dynamicAnchor', function () {
          const fixturePath = path.join(rootFixturePath, 'dynamic-ref');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should preserve $dynamicRef and $dynamicAnchor verbatim', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/components/inputs/tree/$dynamicAnchor'),
              ),
              'node',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/inputs/tree/properties/children/items/$dynamicRef',
                ),
              ),
              '#node',
            );
          });

          specify('should rebase the referencing $ref onto the resource $id', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/inputs/Tree/$ref')),
              'https://example.com/schemas/tree',
            );
          });
        });

        context('given two references to the same external schema resource', function () {
          const fixturePath = path.join(rootFixturePath, 'shared-target');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should embed the resource only once', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const inputs = toValue(
              evaluate(bundled.result as Element, '/components/inputs'),
            ) as Record<string, object>;

            assert.hasAllKeys(inputs, ['Cat', 'Dog', 'pets']);
          });

          specify('should rebase both referencing $refs onto the resource $id', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/inputs/Cat/properties/friend/$ref',
                ),
              ),
              'https://example.com/schemas/pets#/$defs/Pet',
            );
            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/components/inputs/Dog/properties/rival/$ref'),
              ),
              'https://example.com/schemas/pets#/$defs/Pet',
            );
          });
        });

        context('given an external schema that references another external schema', function () {
          const fixturePath = path.join(rootFixturePath, 'nested-external');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should embed both resources flat into components.inputs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const inputs = toValue(
              evaluate(bundled.result as Element, '/components/inputs'),
            ) as Record<string, object>;

            assert.hasAllKeys(inputs, ['Order', 'order', 'item']);
          });

          specify('should leave the nested $ref unchanged', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/inputs/order/properties/item/$ref',
                ),
              ),
              './item.json',
            );
          });
        });

        context('given external schema resources living in a subdirectory', function () {
          const fixturePath = path.join(rootFixturePath, 'subdirectory-resources');
          const rootFilePath = path.join(fixturePath, 'root.json');

          let bundled: ParseResultElement;
          let tmpDir: string;

          beforeEach(async function () {
            bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apidom-bundle-'));
          });

          afterEach(function () {
            fs.rmSync(tmpDir, { recursive: true, force: true });
          });

          specify('should resolve nested $refs against the embedded resource', function () {
            // the embedded `order` resource is placed into the entry document's
            // components; the outer traversal must not re-bundle its `./item.json`
            // against the entry document's base URI
            const inputs = toValue(
              evaluate(bundled.result as Element, '/components/inputs'),
            ) as Record<string, object>;

            assert.hasAllKeys(inputs, ['Order', 'order', 'item']);
          });

          specify('should embed each resource once with its subdirectory origin', function () {
            const item = evaluate<Element>(bundled.result as Element, '/components/inputs/item');

            assert.strictEqual(
              toValue(item.meta.get('ref-origin')),
              url.fromFileSystemPath(path.join(fixturePath, 'schemas', 'item.json')),
            );
          });

          specify('should assign $ids relative to the entry document', function () {
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/inputs/order/$id')),
              'schemas/order.json',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/inputs/item/$id')),
              'schemas/item.json',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/inputs/order/properties/item/$ref',
                ),
              ),
              './item.json',
            );
          });

          specify('should leave the referencing $ref unchanged', function () {
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/inputs/Order/$ref')),
              './schemas/order.json',
            );
          });

          specify('should stay self-contained when moved elsewhere', async function () {
            const movedFilePath = path.join(tmpDir, 'root.json');
            fs.writeFileSync(movedFilePath, JSON.stringify(toValue(bundled.result)));

            const dereferenced = await dereference(movedFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  dereferenced.result as Element,
                  '/components/inputs/Order/properties/item/properties/sku/type',
                ),
              ),
              'string',
            );
          });
        });

        context('given Arazzo Object with $self keyword', function () {
          const fixturePath = path.join(rootFixturePath, '$self-base-uri');
          const rootFilePath = path.join(fixturePath, 'root.json');
          let bundled: ParseResultElement;

          beforeEach(async function () {
            bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
          });

          specify('should embed resource resolved against $self base URI', function () {
            const inputs = toValue(
              evaluate(bundled.result as Element, '/components/inputs'),
            ) as Record<string, object>;

            assert.hasAllKeys(inputs, ['User', 'Avatar', 'ex']);
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/inputs/ex/$id')),
              'ex.json',
            );
          });

          specify('should treat reference to $self as internal', function () {
            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/components/inputs/ex/properties/avatar/$ref'),
              ),
              './root.json#/components/inputs/Avatar',
            );
          });
        });

        context('given external schema resource referencing the entry document', function () {
          const fixturePath = path.join(rootFixturePath, 'entry-document-ref');
          const rootFilePath = path.join(fixturePath, 'root.json');
          let bundled: ParseResultElement;

          beforeEach(async function () {
            bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
          });

          specify('should not embed the entry document', function () {
            const inputs = toValue(
              evaluate(bundled.result as Element, '/components/inputs'),
            ) as Record<string, object>;

            assert.hasAllKeys(inputs, ['User', 'Avatar', 'ex']);
          });

          specify('should leave the reference to the entry document unchanged', function () {
            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/components/inputs/ex/properties/avatar/$ref'),
              ),
              './root.json#/components/inputs/Avatar',
            );
          });
        });

        context('given circular external schema resources', function () {
          const fixturePath = path.join(rootFixturePath, 'circular-external');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should terminate and embed each resource once', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const inputs = toValue(
              evaluate(bundled.result as Element, '/components/inputs'),
            ) as Record<string, object>;

            assert.hasAllKeys(inputs, ['Person', 'person', 'pet']);
          });

          specify('should preserve the inner cross-resource $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/inputs/person/properties/pet/$ref',
                ),
              ),
              './pet.json',
            );
            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/components/inputs/pet/properties/owner/$ref'),
              ),
              './person.json',
            );
          });
        });

        context('given an external Schema Object resource without a $id', function () {
          const fixturePath = path.join(rootFixturePath, 'id-assignment');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should assign a $id derived from the retrieval URI', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const inputs = toValue(
              evaluate(bundled.result as Element, '/components/inputs'),
            ) as Record<string, { $id?: string }>;
            const embedded = Object.values(inputs).find((schema) => typeof schema.$id === 'string');

            assert.isDefined(embedded);
            assert.strictEqual(embedded!.$id, 'ex.json');
          });

          specify(
            'should leave the $ref unchanged as it already resolves to the assigned $id',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });

              assert.strictEqual(
                toValue(evaluate(bundled.result as Element, '/components/inputs/Pet/$ref')),
                './ex.json',
              );
            },
          );
        });

        context('given internal Schema Object references only', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-only');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should leave internal $refs untouched and embed nothing', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const inputs = toValue(
              evaluate(bundled.result as Element, '/components/inputs'),
            ) as Record<string, object>;

            assert.hasAllKeys(inputs, ['Pet', 'Person']);
            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/components/inputs/Pet/properties/owner/$ref'),
              ),
              '#/components/inputs/Person',
            );
          });
        });

        context('given an internal Schema Object reference by $id', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-by-id');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should leave the $id reference untouched and embed nothing', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const inputs = toValue(
              evaluate(bundled.result as Element, '/components/inputs'),
            ) as Record<string, object>;

            // a $ref to a $id/URN defined within the entry document is internal
            // even though its URI form is not a bare fragment — it must not embed
            // the entry document into itself
            assert.hasAllKeys(inputs, ['User', 'Pet']);
            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/components/inputs/User/properties/pet/$ref'),
              ),
              'urn:example:pet',
            );
          });
        });

        context(
          'given an internal Schema Object reference inside a document at resolve.maxDepth',
          function () {
            const fixturePath = path.join(rootFixturePath, 'internal-ref-at-max-depth');
            const rootFilePath = path.join(fixturePath, 'root.json');

            specify(
              'should leave the internal $ref untouched without resolving',
              async function () {
                // the embedded resource is reached at depth 1; an internal $ref
                // within it needs no resolution and must not trip resolve.maxDepth
                const bundled = await bundle(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                  resolve: { maxDepth: 1 },
                });

                assert.strictEqual(
                  toValue(
                    evaluate(
                      bundled.result as Element,
                      '/components/inputs/ex/$defs/Node/properties/self/$ref',
                    ),
                  ),
                  '#/$defs/Node',
                );
              },
            );
          },
        );
      });
    });
  });
});
