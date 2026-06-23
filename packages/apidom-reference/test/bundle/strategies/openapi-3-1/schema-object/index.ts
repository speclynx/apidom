import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element, includesClasses, isParseResultElement } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-3-1', function () {
      context('Schema Object', function () {
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
            const schemas = toValue(
              evaluate(bundled.result as Element, '/components/schemas'),
            ) as Record<string, object>;

            assert.lengthOf(Object.keys(schemas), 1);
            const [name] = Object.keys(schemas);
            assert.deepEqual(schemas[name], {
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

          specify('should produce a components-schemas named-content element', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const schemas = evaluate<Element>(bundled.result as Element, '/components/schemas');

            assert.isTrue(includesClasses(schemas, ['components-schemas']));
          });

          specify('should leave the referencing $ref unchanged', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/paths/~1pets/get/responses/200/content/application~1json/schema/$ref',
                ),
              ),
              './ex.json#/$defs/Pet',
            );
          });

          specify('should annotate the embedded resource with its origin', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const embedded = evaluate<Element>(
              bundled.result as Element,
              '/components/schemas/pets',
            );

            assert.match(toValue(embedded.meta.get('ref-origin')) as string, /ex\.json$/);
          });
        });

        context('given external Schema Object referenced by absolute $id URI', function () {
          const fixturePath = path.join(rootFixturePath, 'external-id-uri');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should embed the resource and leave the $ref unchanged', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/schemas/pet/$id')),
              'https://example.com/schemas/pet',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/schemas/Pet/$ref')),
              './ex.json',
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
                  '/components/schemas/user/$defs/UserProfile/$anchor',
                ),
              ),
              'user-profile',
            );
          });

          specify('should leave the $anchor reference unchanged', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/schemas/User/properties/profile/$ref',
                ),
              ),
              './ex.json#user-profile',
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
                evaluate(bundled.result as Element, '/components/schemas/tree/$dynamicAnchor'),
              ),
              'node',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/schemas/tree/properties/children/items/$dynamicRef',
                ),
              ),
              '#node',
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
            const schemas = toValue(
              evaluate(bundled.result as Element, '/components/schemas'),
            ) as Record<string, object>;

            assert.hasAllKeys(schemas, ['Cat', 'Dog', 'pets']);
          });

          specify('should leave both referencing $refs unchanged', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/schemas/Cat/properties/friend/$ref',
                ),
              ),
              './ex.json#/$defs/Pet',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/schemas/Dog/properties/rival/$ref',
                ),
              ),
              './ex.json#/$defs/Pet',
            );
          });
        });

        context('given an external schema that references another external schema', function () {
          const fixturePath = path.join(rootFixturePath, 'nested-external');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should embed both resources flat into components.schemas', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const schemas = toValue(
              evaluate(bundled.result as Element, '/components/schemas'),
            ) as Record<string, object>;

            assert.hasAllKeys(schemas, ['Order', 'order', 'item']);
          });

          specify('should leave the nested $ref unchanged', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/schemas/order/properties/item/$ref',
                ),
              ),
              './item.json',
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
            const schemas = toValue(
              evaluate(bundled.result as Element, '/components/schemas'),
            ) as Record<string, object>;

            assert.hasAllKeys(schemas, ['Person', 'person', 'pet']);
          });

          specify('should preserve the inner cross-resource $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/schemas/person/properties/pet/$ref',
                ),
              ),
              './pet.json',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/schemas/pet/properties/owner/$ref',
                ),
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
            const schemas = toValue(
              evaluate(bundled.result as Element, '/components/schemas'),
            ) as Record<string, { $id?: string }>;
            const [name] = Object.keys(schemas);

            assert.match(schemas[name].$id as string, /ex\.json$/);
          });
        });

        context('given internal Schema Object references only', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-only');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should leave internal $refs untouched and hoist nothing', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const schemas = toValue(
              evaluate(bundled.result as Element, '/components/schemas'),
            ) as Record<string, object>;

            assert.hasAllKeys(schemas, ['Pet', 'Person']);
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/schemas/Pet/properties/owner/$ref',
                ),
              ),
              '#/components/schemas/Person',
            );
          });
        });

        context('given an internal Schema Object reference by $id', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-by-id');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should leave the $id reference untouched and hoist nothing', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const schemas = toValue(
              evaluate(bundled.result as Element, '/components/schemas'),
            ) as Record<string, object>;

            // a $ref to a $id/URN defined within the entry document is internal
            // even though its URI form is not a bare fragment — it must not embed
            // the entry document into itself
            assert.hasAllKeys(schemas, ['User', 'Pet']);
            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, '/components/schemas/User/properties/pet/$ref'),
              ),
              'urn:example:pet',
            );
          });
        });
      });
    });
  });
});
