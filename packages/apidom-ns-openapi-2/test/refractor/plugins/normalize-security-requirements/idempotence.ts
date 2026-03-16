import { expect } from 'chai';
import dedent from 'dedent';
import { toValue, dispatchRefractorPlugins } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  createToolbox,
  refractSwagger,
  refractorPluginNormalizeSecurityRequirements,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-security-requirements', function () {
      specify('should have idempotent characteristics', async function () {
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
        const swaggerElement = refractSwagger(apiDOM.result);
        const options = {
          toolboxCreator: createToolbox,
        };

        dispatchRefractorPlugins(
          swaggerElement,
          [refractorPluginNormalizeSecurityRequirements()],
          options,
        );
        dispatchRefractorPlugins(
          swaggerElement,
          [refractorPluginNormalizeSecurityRequirements()],
          options,
        );
        dispatchRefractorPlugins(
          swaggerElement,
          [refractorPluginNormalizeSecurityRequirements()],
          options,
        );

        expect(toValue(apiDOM.result)).toMatchSnapshot();
      });
    });
  });
});
