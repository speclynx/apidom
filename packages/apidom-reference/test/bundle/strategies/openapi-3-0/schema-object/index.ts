import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-0';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle } from '../../../../../src/index.ts';
import type { ComponentNameResolverArgs } from '../../../../../src/options/index.ts';

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
                bundle: { componentNamesStrategy: 'title' },
              });

              assert.property(
                toValue(evaluate(bundled.result as Element, '/components/schemas')) as object,
                'PetModel',
              );
              assert.strictEqual(
                toValue(
                  evaluate(
                    bundled.result as Element,
                    '/paths/~1pets/get/responses/200/content/application~1json/schema/$ref',
                  ),
                ),
                '#/components/schemas/PetModel',
              );
            });
          });

          context('set to a custom resolver function', function () {
            specify('should name the hoisted schema from the resolver', async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: {
                  componentNamesStrategy: ({ field }: ComponentNameResolverArgs) =>
                    `Custom_${field}`,
                },
              });

              assert.property(
                toValue(evaluate(bundled.result as Element, '/components/schemas')) as object,
                'Custom_schemas',
              );
            });
          });

          context('left at default ("basename")', function () {
            specify('should name the hoisted schema from the pointer basename', async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });

              assert.property(
                toValue(evaluate(bundled.result as Element, '/components/schemas')) as object,
                'petDefinition',
              );
            });
          });

          context('set to "title" but the schema has no title', function () {
            specify('should fall back to the pointer basename', async function () {
              const fallbackFilePath = path.join(rootFixturePath, 'title-fallback', 'root.json');
              const bundled = await bundle(fallbackFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: { componentNamesStrategy: 'title' },
              });

              assert.property(
                toValue(evaluate(bundled.result as Element, '/components/schemas')) as object,
                'untitledSchema',
              );
            });
          });

          context('set to "title" with characters invalid in a component name', function () {
            specify('should sanitize the title into the component name', async function () {
              const sanitizeFilePath = path.join(rootFixturePath, 'title-sanitize', 'root.json');
              const bundled = await bundle(sanitizeFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: { componentNamesStrategy: 'title' },
              });

              assert.property(
                toValue(evaluate(bundled.result as Element, '/components/schemas')) as object,
                'Pet-Model-v2',
              );
            });
          });

          context('set to "title" with two schemas sharing a title but differing', function () {
            specify('should suffix-rename and warn', async function () {
              const collisionFilePath = path.join(rootFixturePath, 'title-collision', 'root.json');
              const bundled = await bundle(collisionFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: { componentNamesStrategy: 'title' },
              });

              assert.hasAllKeys(
                toValue(evaluate(bundled.result as Element, '/components/schemas')) as object,
                ['SharedTitle', 'SharedTitle-2'],
              );
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

              assert.deepEqual(
                toValue(
                  evaluate(
                    bundled.result as Element,
                    '/paths/~1a/get/responses/200/content/application~1json/schema/properties',
                  ),
                ),
                {
                  $ref: { type: 'string' },
                  externalValue: { type: 'string' },
                },
              );
              assert.notProperty(
                toValue(evaluate(bundled.result as Element, '')) as object,
                'components',
              );
            });
          },
        );
      });
    });
  });
});
