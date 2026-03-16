import { expect } from 'chai';
import dedent from 'dedent';
import { sexprs } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import { refractOpenApi3_0, refractorPluginNormalizeServers } from '../../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-servers', function () {
      context('given Path Item Object is defined in Components.callbacks', function () {
        specify('should skip the Path Item from normalization', async function () {
          const yamlDefinition = dedent`
              openapi: 3.0.4
              servers:
               - url: https://example.com/
                 description: production server
              components:
                callbacks:
                  myCallback:
                    "{$url}":
                       get: {}
            `;
          const apiDOM = await parse(yamlDefinition);
          const openApiElement = refractOpenApi3_0(apiDOM.result, {
            plugins: [refractorPluginNormalizeServers()],
          });

          expect(sexprs(openApiElement)).toMatchSnapshot();
        });
      });
    });
  });
});
