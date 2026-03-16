import { expect } from 'chai';
import dedent from 'dedent';
import { toValue, dispatchRefractorPlugins } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  createToolbox,
  refractSwagger,
  refractorPluginNormalizeParameters,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-parameters', function () {
      specify('should have idempotent characteristics', async function () {
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
        const swaggerElement = refractSwagger(apiDOM.result);
        const options = {
          toolboxCreator: createToolbox,
        };

        dispatchRefractorPlugins(swaggerElement, [refractorPluginNormalizeParameters()], options);
        dispatchRefractorPlugins(swaggerElement, [refractorPluginNormalizeParameters()], options);
        dispatchRefractorPlugins(swaggerElement, [refractorPluginNormalizeParameters()], options);

        expect(toValue(apiDOM.result)).toMatchSnapshot();
      });
    });
  });
});
