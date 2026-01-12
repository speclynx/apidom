import { assert } from 'chai';
import { ObjectElement, isElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { find } from '@speclynx/apidom-traverse';
import { parse } from '@speclynx/apidom-parser-adapter-json';

import {
  isSchemaElement,
  JsonSchemaDialectElement,
  refractOpenApi3_1,
  refractSchema,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SchemaElement', function () {
      context('$schema keyword in embedded resources', function () {
        context('given Schema Object without $schema keyword', function () {
          specify('should annotate Schema Object with default dialect', function () {
            const genericObjectElement = new ObjectElement({
              openapi: '3.1.0',
              components: {
                schemas: {
                  user: {
                    $id: '1',
                    type: 'object',
                  },
                },
              },
            });
            const openApiElement = refractOpenApi3_1(genericObjectElement);
            const schemaElement = find(openApiElement, (e) => isSchemaElement(e));
            const actual = toValue(schemaElement?.meta.get('inheritedDialectIdentifier'));
            const expected = toValue(JsonSchemaDialectElement.default);

            assert.strictEqual(actual, expected);
          });
        });

        context(
          'given direct refracting to Schema Element from generic Object Element',
          function () {
            context('given no jsonSchemaDialect field', function () {
              specify('should annotate Schema Object with default dialect', function () {
                const genericObjectElement = { type: 'object' };

                const schemaElement = refractSchema(genericObjectElement);
                const actual = toValue(schemaElement.meta.get('inheritedDialectIdentifier'));
                const expected = toValue(JsonSchemaDialectElement.default);

                assert.strictEqual(actual, expected);
              });
            });
          },
        );

        context('given Schema Objects are defined after jsonSchemaDialect field', function () {
          specify(
            'should annotate Schema Object with jsonSchemaDialect field value',
            async function () {
              const genericObjectElement = await parse(`{
              "openapi": "3.1",
              "jsonSchemaDialect": "https://arbitrary-schema-url.com/",
              "components": {
                "schemas": {
                  "user": {
                    "type": "object"
                  }
                }
              }
            }`);
              const openApiElement = refractOpenApi3_1(genericObjectElement.result);
              const schemaElement = find(openApiElement, (e) => isSchemaElement(e));
              const actual = toValue(schemaElement?.meta.get('inheritedDialectIdentifier'));
              const expected = 'https://arbitrary-schema-url.com/';

              assert.strictEqual(actual, expected);
            },
          );
        });

        context('given Schema Objects are defined before jsonSchemaDialect field', function () {
          specify(
            'should annotate Schema Object with jsonSchemaDialect field value',
            async function () {
              const genericObjectElement = await parse(`{
              "openapi": "3.1",
              "components": {
                "schemas": {
                  "user": {
                    "type": "object"
                  }
                }
              },
              "jsonSchemaDialect": "https://arbitrary-schema-url.com/"
            }`);
              const openApiElement = refractOpenApi3_1(genericObjectElement.result);
              const schemaElement = find(openApiElement, (e) => isSchemaElement(e));
              const actual = toValue(schemaElement?.meta.get('inheritedDialectIdentifier'));
              const expected = 'https://arbitrary-schema-url.com/';

              assert.strictEqual(actual, expected);
            },
          );
        });

        context('given Schema Object with inner Schemas', function () {
          let genericObjectElement: any;
          let openApiElement: any;

          beforeEach(function () {
            genericObjectElement = new ObjectElement({
              openapi: '3.1.0',
              components: {
                schemas: {
                  user: {
                    $id: '1',
                    type: 'object',
                    oneOf: [
                      {
                        $id: '2',
                        type: 'number',
                        $schema: '$schema1',
                        contains: { $id: '3', type: 'object' },
                      },
                    ],
                    contains: {
                      $id: '4',
                      type: 'string',
                    },
                  },
                },
              },
            });
            openApiElement = refractOpenApi3_1(genericObjectElement);
          });

          specify('should annotate Schema Object($id=1) with appropriate dialect', function () {
            const schemaElement = find(
              openApiElement,
              (e) => isSchemaElement(e) && isElement(e.$id) && e.$id.equals('1'),
            );
            const actual = toValue(schemaElement?.meta.get('inheritedDialectIdentifier'));
            const expected = toValue(JsonSchemaDialectElement.default);

            assert.strictEqual(actual, expected);
          });

          specify('should not annotate Schema Object($id=2) with any dialect', function () {
            const schemaElement = find(
              openApiElement,
              (e) => isSchemaElement(e) && isElement(e.$id) && e.$id.equals('2'),
            );
            // @ts-ignore
            const actual = toValue(schemaElement?.$schema);
            const expected = '$schema1';

            assert.strictEqual(actual, expected);
            assert.isFalse(schemaElement?.meta.hasKey('inheritedDialectIdentifier'));
          });

          specify('should annotate Schema Object($id=3) with appropriate dialect', function () {
            const schemaElement = find(
              openApiElement,
              (e) => isSchemaElement(e) && isElement(e.$id) && e.$id.equals('3'),
            );
            const actual = toValue(schemaElement?.meta.get('inheritedDialectIdentifier'));
            const expected = '$schema1';

            assert.strictEqual(actual, expected);
          });

          specify('should annotate Schema Object($id=4) with appropriate dialect', function () {
            const schemaElement = find(
              openApiElement,
              (e) => isSchemaElement(e) && isElement(e.$id) && e.$id.equals('4'),
            );
            const actual = toValue(schemaElement?.meta.get('inheritedDialectIdentifier'));
            const expected = toValue(JsonSchemaDialectElement.default);

            assert.strictEqual(actual, expected);
          });
        });
      });
    });
  });
});
