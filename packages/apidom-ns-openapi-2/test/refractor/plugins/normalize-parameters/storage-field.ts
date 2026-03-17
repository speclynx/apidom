import { assert } from 'chai';
import dedent from 'dedent';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import { refractSwagger, refractorPluginNormalizeParameters } from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-parameters', function () {
      specify('should use sub-field to store normalized scopes', async function () {
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

        assert.deepEqual(toValue(swaggerElement.get('x-normalized')), {
          parameters: ['/paths/~1/get'],
        });
      });

      context('given custom storage field', function () {
        specify('should use custom storage field to store normalized scopes', async function () {
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
            plugins: [
              refractorPluginNormalizeParameters({
                storageField: '$$normalized',
              }),
            ],
          });

          assert.deepEqual(toValue(swaggerElement.get('$$normalized')), {
            parameters: ['/paths/~1/get'],
          });
        });
      });
    });
  });
});
