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
      context('given Parameter Object is defined in Components.parameters', function () {
        specify('should skip the Parameter Object from normalization', async function () {
          const yamlDefinition = dedent`
              openapi: 3.1.0
              components:
                parameters:
                  parameter1:
                    name: param1
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

      context('given Parameter Object is defined in Components.pathItems', function () {
        specify('should skip the Parameter Object from normalization', async function () {
          const yamlDefinition = dedent`
              openapi: 3.1.0
              components:
                pathItems:
                  pathItem1:
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
    });
  });
});
