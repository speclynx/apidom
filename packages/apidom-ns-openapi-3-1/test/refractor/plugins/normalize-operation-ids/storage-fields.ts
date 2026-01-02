import { assert } from 'chai';
import dedent from 'dedent';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import { refractOpenApi3_1, refractorPluginNormalizeOperationIds } from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-operation-ids', function () {
      specify('should use sub-field to store normalized scopes', async function () {
        const yamlDefinition = dedent`
            openapi: 3.1.0
            components:
              links:
                link1:
                  operationId: get operation ^
            paths:
              /:
                get:
                  operationId: get operation ^
        `;
        const apiDOM = await parse(yamlDefinition);
        const openApiElement = refractOpenApi3_1(apiDOM.result, {
          plugins: [refractorPluginNormalizeOperationIds()],
        });

        assert.deepEqual(toValue(openApiElement.get('x-normalized')), {
          'operation-ids': ['/paths/~1/get'],
        });
      });

      context('given custom storage field', function () {
        specify('should use custom storage field to store normalized scopes', async function () {
          const yamlDefinition = dedent`
            openapi: 3.1.0
            components:
              links:
                link1:
                  operationId: get operation ^
            paths:
              /:
                get:
                  operationId: get operation ^
          `;
          const apiDOM = await parse(yamlDefinition);
          const openApiElement = refractOpenApi3_1(apiDOM.result, {
            plugins: [
              refractorPluginNormalizeOperationIds({
                storageField: '$$normalized',
              }),
            ],
          });

          assert.deepEqual(toValue(openApiElement.get('$$normalized')), {
            'operation-ids': ['/paths/~1/get'],
          });
        });
      });
    });
  });
});
