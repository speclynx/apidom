import { expect } from 'chai';
import dedent from 'dedent';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractOpenApi3_1,
  refractorPluginNormalizeHeaderExamples,
} from '../../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-header-examples', function () {
      context('given Header Object defines examples field', function () {
        context('and Schema Object defines examples field', function () {
          specify('should override Schema Object examples field', async function () {
            const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  get:
                    responses:
                      "200":
                        headers:
                          content-type:
                            schema:
                              type: number
                              examples: [1]
                            examples:
                              example1:
                                value: 2
            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeHeaderExamples()],
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
                  get:
                    responses:
                      "200":
                        headers:
                          content-type:
                            schema:
                              type: number
                              example: 1
                            examples:
                              example1:
                                value: 2
            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeHeaderExamples()],
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
                  get:
                    responses:
                      "200":
                        headers:
                          content-type:
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
                plugins: [refractorPluginNormalizeHeaderExamples()],
              });

              expect(toValue(openApiElement)).toMatchSnapshot();
            },
          );
        });
      });

      context('given Header Object defines example field', function () {
        context('and Schema Object defines examples field', function () {
          specify('should override Schema Object examples field', async function () {
            const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  get:
                    responses:
                      "200":
                        headers:
                          content-type:
                            schema:
                              type: number
                              examples: [1]
                            example: 2

            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeHeaderExamples()],
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
                  get:
                    responses:
                      "200":
                        headers:
                          content-type:
                            schema:
                              type: number
                              example: 1
                            example: 2

            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeHeaderExamples()],
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
                  get:
                    responses:
                      "200":
                        headers:
                          content-type:
                            schema:
                              type: number
                              example: 1
                              examples: [2]
                            example: 3

            `;
              const apiDOM = await parse(yamlDefinition);
              const openApiElement = refractOpenApi3_1(apiDOM.result, {
                plugins: [refractorPluginNormalizeHeaderExamples()],
              });

              expect(toValue(openApiElement)).toMatchSnapshot();
            },
          );
        });
      });

      context('given Header Object defines both example and examples field', function () {
        context('and Schema Object defines examples field', function () {
          specify('should override Schema Object examples field', async function () {
            const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  get:
                    responses:
                      "200":
                        headers:
                          content-type:
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
              plugins: [refractorPluginNormalizeHeaderExamples()],
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
                  get:
                    responses:
                      "200":
                        headers:
                          content-type:
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
              plugins: [refractorPluginNormalizeHeaderExamples()],
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
                  get:
                    responses:
                      "200":
                        headers:
                          content-type:
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
                plugins: [refractorPluginNormalizeHeaderExamples()],
              });

              expect(toValue(openApiElement)).toMatchSnapshot();
            },
          );
        });
      });
    });
  });
});
