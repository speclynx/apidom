import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractOpenApi3_1 } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('OpenApi3_1Element', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const openApiElement = refractOpenApi3_1({
          openapi: '3.1.0',
          info: {},
          jsonSchemaDialect: 'https://spec.openapis.org/oas/3.1/dialect/base',
          servers: [{}],
          paths: {},
          webhooks: {
            pathItem1: {},
            pathItem2: { $ref: '#/path/to/path-item' },
          },
          components: {},
          security: [{}],
          tags: [{}],
          externalDocs: {},
        });

        expect(sexprs(openApiElement)).toMatchSnapshot();
      });
    });
  });
});
