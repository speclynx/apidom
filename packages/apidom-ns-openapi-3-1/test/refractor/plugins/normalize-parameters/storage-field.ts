import { assert } from 'chai';
import dedent from 'dedent';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import { refractOpenApi3_1, refractorPluginNormalizeParameters } from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-parameters', function () {
      specify('should use sub-field to store normalized scopes', async function () {
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
        const openApiElement = refractOpenApi3_1(apiDOM.result, {
          plugins: [refractorPluginNormalizeParameters()],
        });

        assert.deepEqual(toValue(openApiElement.get('x-normalized')), {
          parameters: ['/paths/~1/get'],
        });
      });

      context('given custom storage field', function () {
        specify('should use custom storage field to store normalized scopes', async function () {
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
          const openApiElement = refractOpenApi3_1(apiDOM.result, {
            plugins: [
              refractorPluginNormalizeParameters({
                storageField: '$$normalized',
              }),
            ],
          });

          assert.deepEqual(toValue(openApiElement.get('$$normalized')), {
            parameters: ['/paths/~1/get'],
          });
        });
      });
    });
  });
});
