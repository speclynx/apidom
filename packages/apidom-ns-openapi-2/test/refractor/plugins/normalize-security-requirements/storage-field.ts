import { assert } from 'chai';
import dedent from 'dedent';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractSwagger,
  refractorPluginNormalizeSecurityRequirements,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-security-requirements', function () {
      specify('should use sub-field to store normalized scopes', async function () {
        const yamlDefinition = dedent`
            swagger: '2.0'
            paths:
              /:
                get: {}
            security:
              - petstore_auth:
                - write:pets
                - read:pets
  `;
        const apiDOM = await parse(yamlDefinition);
        const swaggerElement = refractSwagger(apiDOM.result, {
          plugins: [refractorPluginNormalizeSecurityRequirements()],
        });

        assert.deepEqual(toValue(swaggerElement.get('x-normalized')), {
          'security-requirements': ['/paths/~1/get'],
        });
      });

      context('given custom storage field', function () {
        specify('should use custom storage field to store normalized scopes', async function () {
          const yamlDefinition = dedent`
                swagger: '2.0'
                paths:
                  /:
                    get: {}
                security:
                  - petstore_auth:
                    - write:pets
                    - read:pets
          `;
          const apiDOM = await parse(yamlDefinition);
          const swaggerElement = refractSwagger(apiDOM.result, {
            plugins: [
              refractorPluginNormalizeSecurityRequirements({
                storageField: '$$normalized',
              }),
            ],
          });

          assert.deepEqual(toValue(swaggerElement.get('$$normalized')), {
            'security-requirements': ['/paths/~1/get'],
          });
        });
      });
    });
  });
});
