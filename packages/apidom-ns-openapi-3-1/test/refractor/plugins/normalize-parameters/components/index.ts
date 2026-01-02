import { expect } from 'chai';
import dedent from 'dedent';
import { sexprs } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import { refractOpenApi3_1, refractorPluginNormalizeParameters } from '../../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-parameters', function () {
      context('given Path Item Object is defined in Components.pathItems', function () {
        specify('should skip the Path Item from normalization', async function () {
          const yamlDefinition = dedent`
              openapi: 3.1.0
              components:
                pathItems:
                  pathItem1:
                    parameters:
                      - name: param1
                        in: query
                      - name: param2
                        in: query
                    get: {}
            `;
          const apiDOM = await parse(yamlDefinition);
          const openApiElement = refractOpenApi3_1(apiDOM.result, {
            plugins: [refractorPluginNormalizeParameters()],
          });

          expect(sexprs(openApiElement)).toMatchSnapshot();
        });
      });

      context('given Path Item Object is defined in Components.callbacks', function () {
        specify('should skip the Path Item from normalization', async function () {
          const yamlDefinition = dedent`
              openapi: 3.1.0
              components:
                callbacks:
                  myCallback:
                    "{$url}":
                       parameters:
                         - name: param3
                           in: query
                       get: {}
            `;
          const apiDOM = await parse(yamlDefinition);
          const openApiElement = refractOpenApi3_1(apiDOM.result, {
            plugins: [refractorPluginNormalizeParameters()],
          });

          expect(sexprs(openApiElement)).toMatchSnapshot();
        });
      });
    });
  });
});
