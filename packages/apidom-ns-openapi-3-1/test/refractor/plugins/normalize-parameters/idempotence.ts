import { expect } from 'chai';
import dedent from 'dedent';
import { toValue, dispatchRefractorPlugins } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  createToolbox,
  refractOpenApi3_1,
  refractorPluginNormalizeParameters,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-parameters', function () {
      specify('should have idempotent characteristics', async function () {
        const yamlDefinition = dedent`
            openapi: 3.1.0
            paths:
              /:
                parameters:
                  - name: param1
                    in: query
                  - name: param2
                    in: query
                get:
                  parameters:
                    - name: param3
                      in: query
      `;
        const apiDOM = await parse(yamlDefinition);
        const openApiElement = refractOpenApi3_1(apiDOM.result);
        const options = {
          toolboxCreator: createToolbox,
        };

        dispatchRefractorPlugins(openApiElement, [refractorPluginNormalizeParameters()], options);
        dispatchRefractorPlugins(openApiElement, [refractorPluginNormalizeParameters()], options);
        dispatchRefractorPlugins(openApiElement, [refractorPluginNormalizeParameters()], options);

        expect(toValue(apiDOM.result)).toMatchSnapshot();
      });
    });
  });
});
