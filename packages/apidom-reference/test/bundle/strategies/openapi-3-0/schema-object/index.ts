import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-0';

import { bundle } from '../../../../../src/index.ts';
import OpenAPI3_0BundleStrategy from '../../../../../src/bundle/strategies/openapi-3-0/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-3-0', function () {
      context('Schema Object', function () {
        context('given componentNamesStrategy', function () {
          const fixturePath = path.join(rootFixturePath, 'title-naming');
          const rootFilePath = path.join(fixturePath, 'root.json');

          context('set to "title"', function () {
            specify('should name the hoisted schema from its title', async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: {
                  strategies: [new OpenAPI3_0BundleStrategy({ componentNamesStrategy: 'title' })],
                },
              });
              const value = toValue(bundled.result as Element);

              assert.property(value.components.schemas, 'PetModel');
              assert.strictEqual(
                value.paths['/pets'].get.responses['200'].content['application/json'].schema.$ref,
                '#/components/schemas/PetModel',
              );
            });
          });

          context('set to a custom resolver function', function () {
            specify('should name the hoisted schema from the resolver', async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: {
                  strategies: [
                    new OpenAPI3_0BundleStrategy({
                      componentNamesStrategy: ({ field }) => `Custom_${field}`,
                    }),
                  ],
                },
              });
              const value = toValue(bundled.result as Element);

              assert.property(value.components.schemas, 'Custom_schemas');
            });
          });

          context('left at default ("basename")', function () {
            specify('should name the hoisted schema from the pointer basename', async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const value = toValue(bundled.result as Element);

              assert.property(value.components.schemas, 'petDefinition');
            });
          });

          context('set to "title" but the schema has no title', function () {
            specify('should fall back to the pointer basename', async function () {
              const fallbackFilePath = path.join(rootFixturePath, 'title-fallback', 'root.json');
              const bundled = await bundle(fallbackFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: {
                  strategies: [new OpenAPI3_0BundleStrategy({ componentNamesStrategy: 'title' })],
                },
              });
              const value = toValue(bundled.result as Element);

              assert.property(value.components.schemas, 'untitledSchema');
            });
          });

          context('set to "title" with characters invalid in a component name', function () {
            specify('should sanitize the title into the component name', async function () {
              const sanitizeFilePath = path.join(rootFixturePath, 'title-sanitize', 'root.json');
              const bundled = await bundle(sanitizeFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: {
                  strategies: [new OpenAPI3_0BundleStrategy({ componentNamesStrategy: 'title' })],
                },
              });
              const value = toValue(bundled.result as Element);

              assert.property(value.components.schemas, 'Pet-Model-v2');
            });
          });

          context('set to "title" with two schemas sharing a title but differing', function () {
            specify('should suffix-rename and warn', async function () {
              const collisionFilePath = path.join(rootFixturePath, 'title-collision', 'root.json');
              const bundled = await bundle(collisionFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: {
                  strategies: [new OpenAPI3_0BundleStrategy({ componentNamesStrategy: 'title' })],
                },
              });
              const value = toValue(bundled.result as Element);

              assert.hasAllKeys(value.components.schemas, ['SharedTitle', 'SharedTitle-2']);
              assert.lengthOf(bundled.warnings, 1);
            });
          });
        });

        context(
          'given a schema with properties literally named $ref and externalValue',
          function () {
            const fixturePath = path.join(rootFixturePath, 'literal-ref-property');
            const rootFilePath = path.join(fixturePath, 'root.json');

            specify('should leave the literal property keys untouched', async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const value = toValue(bundled.result as Element);
              const schema =
                value.paths['/a'].get.responses['200'].content['application/json'].schema;

              assert.deepEqual(schema.properties, {
                $ref: { type: 'string' },
                externalValue: { type: 'string' },
              });
              assert.notProperty(value, 'components');
            });
          },
        );
      });
    });
  });
});
