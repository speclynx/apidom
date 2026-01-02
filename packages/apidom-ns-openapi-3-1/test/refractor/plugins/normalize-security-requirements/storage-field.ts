import { assert } from 'chai';
import dedent from 'dedent';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractOpenApi3_1,
  refractorPluginNormalizeSecurityRequirements,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-security-requirements', function () {
      specify('should use sub-field to store normalized scopes', async function () {
        const yamlDefinition = dedent`
            openapi: 3.1.0
            paths:
              /:
                get: {}
            security:
              - petstore_auth:
                - write:pets
                - read:pets
  `;
        const apiDOM = await parse(yamlDefinition);
        const openApiElement = refractOpenApi3_1(apiDOM.result, {
          plugins: [refractorPluginNormalizeSecurityRequirements()],
        });

        assert.deepEqual(toValue(openApiElement.get('x-normalized')), {
          'security-requirements': ['/paths/~1/get'],
        });
      });

      context('given custom storage field', function () {
        specify('should use custom storage field to store normalized scopes', async function () {
          const yamlDefinition = dedent`
                openapi: 3.1.0
                paths:
                  /:
                    get: {}
                security:
                  - petstore_auth:
                    - write:pets
                    - read:pets
          `;
          const apiDOM = await parse(yamlDefinition);
          const openApiElement = refractOpenApi3_1(apiDOM.result, {
            plugins: [
              refractorPluginNormalizeSecurityRequirements({
                storageField: '$$normalized',
              }),
            ],
          });

          assert.deepEqual(toValue(openApiElement.get('$$normalized')), {
            'security-requirements': ['/paths/~1/get'],
          });
        });
      });
    });
  });
});
