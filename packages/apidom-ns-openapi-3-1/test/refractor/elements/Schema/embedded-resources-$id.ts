import { assert } from 'chai';
import { ObjectElement, isElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { find } from '@speclynx/apidom-traverse';

import { isSchemaElement, refractOpenApi3_1 } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SchemaElement', function () {
      context('plugins', function () {
        context('$id keyword in embedded resources', function () {
          context('given Schema Object without $id keyword', function () {
            specify('should have empty ancestorsSchemaIdentifiers', function () {
              const genericObjectElement = new ObjectElement({
                openapi: '3.1.0',
                components: {
                  schemas: {
                    user: {
                      type: 'object',
                    },
                  },
                },
              });
              const openApiElement = refractOpenApi3_1(genericObjectElement);
              const schemaElement = find(openApiElement, (e) => isSchemaElement(e));
              const actual = toValue(schemaElement?.meta.get('ancestorsSchemaIdentifiers'));

              assert.deepEqual(actual, []);
            });
          });

          context('given Schema Object with arbitrary fields boundaries', function () {
            specify(
              'should annotate Schema($anchor=1) with ancestorsSchemaIdentifiers',
              function () {
                const genericObjectElement = new ObjectElement({
                  openapi: '3.1.0',
                  components: {
                    schemas: {
                      User: {
                        $id: './nested/',
                        type: 'object',
                        properties: {
                          profile: {
                            $anchor: '1',
                            $ref: './ex.json',
                          },
                        },
                      },
                    },
                  },
                });
                const openApiElement = refractOpenApi3_1(genericObjectElement);
                const schemaElement = find(
                  openApiElement,
                  (e) => isSchemaElement(e) && isElement(e.$anchor) && e.$anchor.equals('1'),
                );
                const actual = toValue(schemaElement?.meta.get('ancestorsSchemaIdentifiers'));

                assert.deepEqual(actual, ['./nested/']);
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
                    User: {
                      $anchor: '1',
                      type: 'object',
                      oneOf: [
                        {
                          $id: '$id1',
                          $anchor: '2',
                          type: 'number',
                          contains: { $id: '$id2', $anchor: '3', type: 'object' },
                        },
                      ],
                      contains: {
                        $anchor: '4',
                        type: 'string',
                      },
                    },
                  },
                },
              });
              openApiElement = refractOpenApi3_1(genericObjectElement);
            });

            specify(
              'should annotate Schema Object($anchor=1) with ancestorsSchemaIdentifiers',
              function () {
                const schemaElement = find(
                  openApiElement,
                  (e) => isSchemaElement(e) && isElement(e.$anchor) && e.$anchor.equals('1'),
                );
                const actual = toValue(schemaElement?.meta.get('ancestorsSchemaIdentifiers'));

                assert.deepEqual(actual, []);
              },
            );

            specify(
              'should annotate Schema Object($anchor=2) with ancestorsSchemaIdentifiers',
              function () {
                const schemaElement = find(
                  openApiElement,
                  (e) => isSchemaElement(e) && isElement(e.$anchor) && e.$anchor.equals('2'),
                );
                const actual = toValue(schemaElement?.meta.get('ancestorsSchemaIdentifiers'));

                assert.deepEqual(actual, ['$id1']);
              },
            );

            specify(
              'should annotate Schema Object($anchor=3) with ancestorsSchemaIdentifiers',
              function () {
                const schemaElement = find(
                  openApiElement,
                  (e) => isSchemaElement(e) && isElement(e.$anchor) && e.$anchor.equals('3'),
                );
                const actual = toValue(schemaElement?.meta.get('ancestorsSchemaIdentifiers'));

                assert.deepEqual(actual, ['$id1', '$id2']);
              },
            );

            specify(
              'should not annotate Schema Object($anchor=4) with ancestorsSchemaIdentifiers',
              function () {
                const schemaElement = find(
                  openApiElement,
                  (e) => isSchemaElement(e) && isElement(e.$anchor) && e.$anchor.equals('4'),
                );
                const actual = toValue(schemaElement?.meta.get('ancestorsSchemaIdentifiers'));

                assert.deepEqual(actual, []);
              },
            );
          });
        });
      });
    });
  });
});
