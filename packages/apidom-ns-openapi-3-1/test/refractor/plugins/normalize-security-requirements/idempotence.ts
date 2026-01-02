import { expect } from 'chai';
import dedent from 'dedent';
import { toValue, dispatchRefractorPlugins } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  createToolbox,
  refractOpenApi3_1,
  refractorPluginNormalizeSecurityRequirements,
  keyMap,
  getNodeType,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-security-requirements', function () {
      specify('should have idempotent characteristics', async function () {
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
        const openApiElement = refractOpenApi3_1(apiDOM.result);
        const options = {
          toolboxCreator: createToolbox,
          visitorOptions: { keyMap, nodeTypeGetter: getNodeType },
        };

        dispatchRefractorPlugins(
          openApiElement,
          [refractorPluginNormalizeSecurityRequirements()],
          options,
        );
        dispatchRefractorPlugins(
          openApiElement,
          [refractorPluginNormalizeSecurityRequirements()],
          options,
        );
        dispatchRefractorPlugins(
          openApiElement,
          [refractorPluginNormalizeSecurityRequirements()],
          options,
        );

        expect(toValue(apiDOM.result)).toMatchSnapshot();
      });
    });
  });
});
