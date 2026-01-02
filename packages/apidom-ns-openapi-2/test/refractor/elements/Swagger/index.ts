import { assert, expect } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractSwagger, SwaggerElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SwaggerElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const swaggerElement = refractSwagger({
          swagger: '2.0',
          info: {},
          host: 'https://example.com/terms/',
          basePath: '/base-path',
          schemes: ['https'],
          consumes: ['application/json'],
          produces: ['application/json'],
          paths: {
            '/path': {},
          },
          definitions: {
            schema: {},
          },
          parameters: {
            parameter: {},
          },
          responses: {
            response: {},
          },
          securityDefinitions: {
            api_key: {},
          },
          security: [{}],
          tags: [{}],
          externalDocs: {},
        });

        expect(sexprs(swaggerElement)).toMatchSnapshot();
      });

      specify('should support specification extensions', function () {
        const swaggerElement = refractSwagger({
          swagger: '2.0',
          'x-extension': 'extension',
        }) as SwaggerElement;

        assert.isFalse(
          includesClasses(swaggerElement.getMember('swagger') as any, ['specification-extension']),
        );
        assert.isTrue(
          includesClasses(swaggerElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });
    });
  });
});
