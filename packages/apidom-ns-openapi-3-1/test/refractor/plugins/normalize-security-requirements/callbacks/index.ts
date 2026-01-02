import { expect } from 'chai';
import dedent from 'dedent';
import { sexprs } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractOpenApi3_1,
  refractorPluginNormalizeSecurityRequirements,
} from '../../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-security-requirements', function () {
      context('given OpenAPI.security fixed field is defined', function () {
        context('and Operation.security is not defined', function () {
          specify(
            'should inherit Security Requirements from OpenAPI.security field',
            async function () {
              const yamlDefinition = dedent`
              openapi: 3.1.0
              security:
                - petstore_auth:
                    - write:pets
                    - read:pets
              paths:
                /:
                  get:
                    callbacks:
                      myCallback:
                        "{$url}":
                           get: {}
            `;
              const apiDOM = await parse(yamlDefinition);
              const openApiElement = refractOpenApi3_1(apiDOM.result, {
                plugins: [refractorPluginNormalizeSecurityRequirements()],
              });

              expect(sexprs(openApiElement)).toMatchSnapshot();
            },
          );
        });

        context('and Operation.security is defined as empty list', function () {
          specify(
            'should not inherit Security Requirements from OpenAPI.security field',
            async function () {
              const yamlDefinition = dedent`
              openapi: 3.1.0
              security:
                - petstore_auth:
                    - write:pets
                    - read:pets
              paths:
                /:
                  get:
                    callbacks:
                      myCallback:
                        "{$url}":
                           get:
                             security: []
            `;
              const apiDOM = await parse(yamlDefinition);
              const openApiElement = refractOpenApi3_1(apiDOM.result, {
                plugins: [refractorPluginNormalizeSecurityRequirements()],
              });

              expect(sexprs(openApiElement)).toMatchSnapshot();
            },
          );
        });

        context('and Operation.security contains single Security Requirement', function () {
          specify(
            'should not inherit Security Requirements from OpenAPI.security field',
            async function () {
              const yamlDefinition = dedent`
              openapi: 3.1.0
              security:
                - petstore_auth:
                    - write:pets
                    - read:pets
              paths:
                /:
                  get:
                    callbacks:
                      myCallback:
                        "{$url}":
                           get:
                             security: [{}]
            `;
              const apiDOM = await parse(yamlDefinition);
              const openApiElement = refractOpenApi3_1(apiDOM.result, {
                plugins: [refractorPluginNormalizeSecurityRequirements()],
              });

              expect(sexprs(openApiElement)).toMatchSnapshot();
            },
          );
        });
      });

      context('given OpenAPI.security fixed field is not defined', function () {
        context('and Operation.security is defined', function () {
          specify('should do nothing', async function () {
            const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  get:
                    callbacks:
                      myCallback:
                        "{$url}":
                           get:
                             security: [{}]
            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeSecurityRequirements()],
            });

            expect(sexprs(openApiElement)).toMatchSnapshot();
          });
        });

        context('and Operation.security is not defined', function () {
          specify('should do nothing', async function () {
            const yamlDefinition = dedent`
              openapi: 3.1.0
              paths:
                /:
                  get:
                    callbacks:
                      myCallback:
                        "{$url}":
                           get: {}
            `;
            const apiDOM = await parse(yamlDefinition);
            const openApiElement = refractOpenApi3_1(apiDOM.result, {
              plugins: [refractorPluginNormalizeSecurityRequirements()],
            });

            expect(sexprs(openApiElement)).toMatchSnapshot();
          });
        });
      });
    });
  });
});
