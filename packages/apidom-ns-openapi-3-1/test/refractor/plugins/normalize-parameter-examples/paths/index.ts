import { expect } from 'chai';
import dedent from 'dedent';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractOpenApi3_1,
  refractorPluginNormalizeParameterExamples,
} from '../../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-parameter-examples', function () {
      context('given multiple Parameter Objects in a list', function () {
        specify('should normalize every Parameter Object', async function () {
          const yamlDefinition = dedent`
            openapi: 3.1.0
            paths:
              /:
                parameters:
                  - name: param1
                    in: query
                    schema:
                      type: number
                      examples: [1]
                    examples:
                      example1:
                        value: 2
                  - name: param2
                    in: query
                    schema:
                      type: number
                      examples: [3]
                    examples:
                      example1:
                        value: 4
          `;
          const apiDOM = await parse(yamlDefinition);
          const openApiElement = refractOpenApi3_1(apiDOM.result, {
            plugins: [refractorPluginNormalizeParameterExamples()],
          });
          const value = toValue(openApiElement) as any;

          expect(value.paths['/'].parameters[0].schema.examples).to.deep.equal([2]);
          expect(value.paths['/'].parameters[1].schema.examples).to.deep.equal([4]);
          expect(value['x-normalized']['parameter-examples']).to.deep.equal([
            '/paths/~1/parameters/0',
            '/paths/~1/parameters/1',
          ]);
        });
      });

      context('given Parameter Object defines examples field', function () {
        context('and Schema Object defines examples field', function () {
          specify('should override Schema Object examples field', async function () {
            const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      schema:
                        type: number
                        examples: [1]
                      examples:
                        example1:
                          value: 2
            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeParameterExamples()],
            });

            expect(toValue(openApiElement)).toMatchSnapshot();
          });
        });

        context('and Schema Object defines example field', function () {
          specify('should override Schema Object example field', async function () {
            const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      schema:
                        type: number
                        example: 1
                      examples:
                        example1:
                          value: 2
            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeParameterExamples()],
            });

            expect(toValue(openApiElement)).toMatchSnapshot();
          });
        });

        context('and Schema Object defines both example and examples fields', function () {
          specify(
            'should override both Schema Object example and examples fields',
            async function () {
              const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      schema:
                        type: number
                        example: 1
                        examples: [2]
                      examples:
                        example1:
                          value: 3

            `;
              const apiDOM = await parse(yamlDefinition);
              const openApiElement = refractOpenApi3_1(apiDOM.result, {
                plugins: [refractorPluginNormalizeParameterExamples()],
              });

              expect(toValue(openApiElement)).toMatchSnapshot();
            },
          );
        });
      });

      context('given Parameter Object defines example field', function () {
        context('and Schema Object defines examples field', function () {
          specify('should override Schema Object examples field', async function () {
            const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      schema:
                        type: number
                        examples: [2]
                      example: 2

            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeParameterExamples()],
            });

            expect(toValue(openApiElement)).toMatchSnapshot();
          });
        });

        context('and Schema Object defines example field', function () {
          specify('should override Schema Object example field', async function () {
            const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      schema:
                        type: number
                        example: 1
                      example: 2

            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeParameterExamples()],
            });

            expect(toValue(openApiElement)).toMatchSnapshot();
          });
        });

        context('and Schema Object defines both example and examples fields', function () {
          specify(
            'should override both Schema Object example and examples fields',
            async function () {
              const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      schema:
                        type: number
                        example: 1
                        examples: [2]
                      example: 3

            `;
              const apiDOM = await parse(yamlDefinition);
              const openApiElement = refractOpenApi3_1(apiDOM.result, {
                plugins: [refractorPluginNormalizeParameterExamples()],
              });

              expect(toValue(openApiElement)).toMatchSnapshot();
            },
          );
        });
      });

      context('given Parameter Object defines both example and examples field', function () {
        context('and Schema Object defines examples field', function () {
          specify('should override Schema Object examples field', async function () {
            const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      schema:
                        type: number
                        examples: [1]
                      examples:
                        example1:
                          value: 2
                      example: 3

            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeParameterExamples()],
            });

            expect(toValue(openApiElement)).toMatchSnapshot();
          });
        });

        context('and Schema Object defines example field', function () {
          specify('should override Schema Object example field', async function () {
            const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      schema:
                        type: number
                        example: 1
                      examples:
                        example1:
                          value: 2
                      example: 3

            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeParameterExamples()],
            });

            expect(toValue(openApiElement)).toMatchSnapshot();
          });
        });

        context('and Schema Object defines both example and examples fields', function () {
          specify(
            'should override both Schema Object example and examples fields',
            async function () {
              const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      schema:
                        type: number
                        example: 1
                        examples: [2]
                      examples:
                        example1:
                          value: 3
                      example: 4

            `;
              const apiDOM = await parse(yamlDefinition);
              const openApiElement = refractOpenApi3_1(apiDOM.result, {
                plugins: [refractorPluginNormalizeParameterExamples()],
              });

              expect(toValue(openApiElement)).toMatchSnapshot();
            },
          );
        });
      });
    });
  });
});
