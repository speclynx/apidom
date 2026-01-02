import { assert } from 'chai';
import dedent from 'dedent';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractOpenApi3_1,
  refractorPluginNormalizeParameterExamples,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-parameter-examples', function () {
      specify('should use sub-field to store normalized scopes', async function () {
        const yamlDefinition = dedent`
            openapi: 3.1.0
            paths:
              /:
                get:
                  parameters:
                      - in: query
                        name: idempotent
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

        assert.deepEqual(toValue(openApiElement.get('x-normalized')), {
          'parameter-examples': ['/paths/~1/get/parameters/0'],
        });
      });

      context('given custom storage field', function () {
        specify('should use custom storage field to store normalized scopes', async function () {
          const yamlDefinition = dedent`
                openapi: 3.1.0
                paths:
                  /:
                    get:
                      parameters:
                        - in: query
                          name: idempotent
                          schema:
                            type: number
                            example: 1
                          examples:
                            example1:
                              value: 2
          `;
          const apiDOM = await parse(yamlDefinition);
          const openApiElement = refractOpenApi3_1(apiDOM.result, {
            plugins: [
              refractorPluginNormalizeParameterExamples({
                storageField: '$$normalized',
              }),
            ],
          });

          assert.deepEqual(toValue(openApiElement.get('$$normalized')), {
            'parameter-examples': ['/paths/~1/get/parameters/0'],
          });
        });
      });
    });
  });
});
