import { expect } from 'chai';
import dedent from 'dedent';
import { sexprs } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import { refractSwagger, refractorPluginNormalizeParameters } from '../../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-parameters', function () {
      context('given parameters are defined in Path Item Object', function () {
        context("and Operation Object doesn't define any parameters", function () {
          specify('should inherit all Path Item parameters', async function () {
            const yamlDefinition = dedent`
              swagger: '2.0'
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      type: string
                    - name: param2
                      in: query
                      type: string
                  get: {}
            `;
            const apiDOM = await parse(yamlDefinition);
            const swaggerElement = refractSwagger(apiDOM.result, {
              plugins: [refractorPluginNormalizeParameters()],
            });

            expect(sexprs(swaggerElement)).toMatchSnapshot();
          });
        });

        context('and Operation Object defines empty parameters', function () {
          specify('should inherit all Path Item parameters', async function () {
            const yamlDefinition = dedent`
              swagger: '2.0'
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      type: string
                    - name: param2
                      in: query
                      type: string
                  get:
                    parameters: []
            `;
            const apiDOM = await parse(yamlDefinition);
            const swaggerElement = refractSwagger(apiDOM.result, {
              plugins: [refractorPluginNormalizeParameters()],
            });

            expect(sexprs(swaggerElement)).toMatchSnapshot();
          });
        });

        context('and multiple empty Operations are present', function () {
          specify(
            'should inherit all Path Item parameters in each Operation Object',
            async function () {
              const yamlDefinition = dedent`
              swagger: '2.0'
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      type: string
                    - name: param2
                      in: query
                      type: string
                  get: {}
                  post: {}
            `;
              const apiDOM = await parse(yamlDefinition);
              const swaggerElement = refractSwagger(apiDOM.result, {
                plugins: [refractorPluginNormalizeParameters()],
              });

              expect(sexprs(swaggerElement)).toMatchSnapshot();
            },
          );
        });

        context('and Operation Object defines additional parameter', function () {
          specify('should merge with all Path Item parameters', async function () {
            const yamlDefinition = dedent`
              swagger: '2.0'
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      type: string
                    - name: param2
                      in: query
                      type: string
                  get:
                    parameters:
                      - name: param3
                        in: query
                        type: string
            `;
            const apiDOM = await parse(yamlDefinition);
            const swaggerElement = refractSwagger(apiDOM.result, {
              plugins: [refractorPluginNormalizeParameters()],
            });

            expect(sexprs(swaggerElement)).toMatchSnapshot();
          });
        });

        context('and Operation Object defines identical parameter', function () {
          specify('should replace Path Item parameter', async function () {
            const yamlDefinition = dedent`
              swagger: '2.0'
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      type: string
                    - name: param2
                      in: query
                      type: string
                  get:
                    parameters:
                      - name: param1
                        in: query
                        type: string
                        description: operation parameter
            `;
            const apiDOM = await parse(yamlDefinition);
            const swaggerElement = refractSwagger(apiDOM.result, {
              plugins: [refractorPluginNormalizeParameters()],
            });

            expect(swaggerElement).toMatchSnapshot();
          });
        });

        context('and Operation Object defines identical parameters', function () {
          specify(
            'should remove Operation identical parameter and merge with all Path Item parameters',
            async function () {
              const yamlDefinition = dedent`
              swagger: '2.0'
              paths:
                /:
                  parameters:
                    - name: param1
                      in: query
                      type: string
                    - name: param2
                      in: query
                      type: string
                  get:
                    parameters:
                      - name: param3
                        in: query
                        type: string
                      - name: param3
                        in: query
                        type: string
                      - name: param4
                        in: query
                        type: string

            `;
              const apiDOM = await parse(yamlDefinition);
              const swaggerElement = refractSwagger(apiDOM.result, {
                plugins: [refractorPluginNormalizeParameters()],
              });

              expect(swaggerElement).toMatchSnapshot();
            },
          );
        });
      });
    });
  });
});
