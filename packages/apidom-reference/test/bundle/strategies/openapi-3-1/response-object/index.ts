import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle, dereferenceApiDOM } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-3-1', function () {
      context('Response Object', function () {
        context('given an external reference in the components/responses field', function () {
          const fixturePath = path.join(rootFixturePath, 'external');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify(
            'should hoist the external fragment into components/responses',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });

              assert.property(
                toValue(evaluate(bundled.result as Element, '/components/responses')) as object,
                'External',
              );
            },
          );

          specify('should rewrite the reference to an internal pointer', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/responses/Local/$ref')),
              '#/components/responses/External',
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

        context('given a hoisted Response Object with a self-identifying schema', function () {
          const fixturePath = path.join(rootFixturePath, 'hoisted-schema-id');
          const rootFilePath = path.join(fixturePath, 'root.json');
          const schemaPointer = (mediaType: string) =>
            `/components/responses/ok/content/${mediaType.replace('/', '~1')}/schema`;

          specify('should leave the $ref resolving against the schema $id', async function () {
            // the $ref resolves within the resource the schema's absolute $id
            // identifies; that resource is hoisted along with the Response
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, `${schemaPointer('application/json')}/$ref`),
              ),
              '#/$defs/Inner',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  `${schemaPointer('application/vnd.anchor+json')}/$ref`,
                ),
              ),
              '#inner',
            );
          });

          specify('should not embed the schema into components/schemas', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.notProperty(
              toValue(evaluate(bundled.result as Element, '/components')) as object,
              'schemas',
            );
          });

          specify('should produce a dereferenceable bundle', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const dereferenced = await dereferenceApiDOM(bundled, {
              parse: { mediaType: mediaTypes.latest('json') },
              resolve: { baseURI: rootFilePath },
              dereference: { immutable: false },
            });
            const content = toValue(
              evaluate(dereferenced.result as Element, '/components/responses/ok/content'),
            ) as Record<string, { schema: Record<string, unknown> }>;

            assert.strictEqual(content['application/json'].schema.type, 'integer');
            assert.strictEqual(content['application/vnd.anchor+json'].schema.type, 'string');
          });
        });

        context('given a hoisted Response Object with relative schema $refs', function () {
          const fixturePath = path.join(rootFixturePath, 'relocated-schema-ref');
          const rootFilePath = path.join(fixturePath, 'root.json');
          const schemaPointer = (mediaType: string) =>
            `/components/responses/ok/content/${mediaType.replace('/', '~1')}/schema`;

          specify('should rewrite the $ref relative to the entry document', async function () {
            // once hoisted, the schema's base URI is the entry document's, so a
            // `$ref` written against `responses/ok.json` would dangle
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, `${schemaPointer('application/json')}/$ref`),
              ),
              'responses/pet.json',
            );
          });

          specify('should keep the $ref fragment', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  `${schemaPointer('application/vnd.name+json')}/$ref`,
                ),
              ),
              'responses/pet.json#/$defs/Name',
            );
          });

          specify('should rewrite against a relative $id that relocates too', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  `${schemaPointer('application/vnd.owner+json')}/$ref`,
                ),
              ),
              '../responses/nested/owner.json',
            );
          });

          specify('should embed each referenced schema resource once', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const schemas = toValue(
              evaluate(bundled.result as Element, '/components/schemas'),
            ) as Record<string, object>;

            assert.hasAllKeys(schemas, ['pet', 'owner']);
          });

          specify('should dereference against the embedded resources', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const dereferenced = await dereferenceApiDOM(bundled, {
              parse: { mediaType: mediaTypes.latest('json') },
              resolve: { baseURI: rootFilePath },
              dereference: { immutable: false },
            });
            const content = toValue(
              evaluate(dereferenced.result as Element, '/components/responses/ok/content'),
            ) as Record<string, { schema: Record<string, unknown> }>;

            assert.strictEqual(content['application/json'].schema.type, 'object');
            assert.strictEqual(content['application/vnd.name+json'].schema.type, 'string');
            assert.deepEqual(content['application/vnd.owner+json'].schema.properties, {
              email: { type: 'string' },
            });
          });
        });

        context('given a hoisted Response Object referencing sibling $id schemas', function () {
          // the external document is itself an OpenAPI 3.1 document; the schemas
          // the hoisted Response references by $id live elsewhere in it and
          // would be left behind unless embedded
          const fixturePath = path.join(rootFixturePath, 'sibling-schema-id');
          const rootFilePath = path.join(fixturePath, 'root.json');
          const schemaPointer = (mediaType: string) =>
            `/components/responses/Ok/content/${mediaType.replace('/', '~1')}/schema`;

          specify('should embed each $id resource once into components/schemas', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const schemas = toValue(
              evaluate(bundled.result as Element, '/components/schemas'),
            ) as Record<string, Record<string, unknown>>;

            assert.hasAllKeys(schemas, ['x', 'owner']);
            assert.strictEqual(schemas.x.$id, 'https://example.com/schemas/x');
            assert.strictEqual(schemas.owner.$id, 'https://example.com/schemas/owner');
          });

          specify('should leave the $refs resolving against the schema $ids', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(
                evaluate(bundled.result as Element, `${schemaPointer('application/json')}/$ref`),
              ),
              'https://example.com/schemas/x',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  `${schemaPointer('application/vnd.inner+json')}/$ref`,
                ),
              ),
              'https://example.com/schemas/x#/$defs/Inner',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  `${schemaPointer('application/vnd.owner+json')}/$ref`,
                ),
              ),
              'https://example.com/schemas/owner',
            );
            assert.strictEqual(
              toValue(
                evaluate(
                  bundled.result as Element,
                  '/components/schemas/owner/properties/pet/$ref',
                ),
              ),
              'https://example.com/schemas/x',
            );
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ext.json');
          });

          specify('should produce a dereferenceable bundle', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const dereferenced = await dereferenceApiDOM(bundled, {
              parse: { mediaType: mediaTypes.latest('json') },
              resolve: { baseURI: rootFilePath },
              dereference: { immutable: false },
            });
            const content = toValue(
              evaluate(dereferenced.result as Element, '/components/responses/Ok/content'),
            ) as Record<string, { schema: Record<string, unknown> }>;

            assert.strictEqual(content['application/json'].schema.type, 'integer');
            assert.strictEqual(content['application/vnd.inner+json'].schema.type, 'string');
            assert.deepEqual(content['application/vnd.owner+json'].schema.properties, {
              pet: {
                $id: 'https://example.com/schemas/x',
                type: 'integer',
                $defs: { Inner: { type: 'string' } },
              },
            });
          });
        });
      });
    });
  });
});
