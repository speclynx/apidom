import { expect } from 'chai';
import dedent from 'dedent';
import { toValue, dispatchRefractorPlugins } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  createToolbox,
  refractOpenApi3_1,
  refractorPluginNormalizeHeaderExamples,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-header-examples', function () {
      specify('should have idempotent characteristics', async function () {
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
        const openApiElement = refractOpenApi3_1(apiDOM.result);
        const options = {
          toolboxCreator: createToolbox,
        };

        dispatchRefractorPlugins(
          openApiElement,
          [refractorPluginNormalizeHeaderExamples()],
          options,
        );
        dispatchRefractorPlugins(
          openApiElement,
          [refractorPluginNormalizeHeaderExamples()],
          options,
        );
        dispatchRefractorPlugins(
          openApiElement,
          [refractorPluginNormalizeHeaderExamples()],
          options,
        );

        expect(toValue(apiDOM.result)).toMatchSnapshot();
      });
    });
  });
});
