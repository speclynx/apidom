import { assert, expect } from 'chai';
import { ArrayElement, ObjectElement, includesClasses } from '@speclynx/apidom-datamodel';
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

      context('given array fields carrying style information', function () {
        specify('should transfer style to the refracted elements', function () {
          const style = { yaml: { styleGroup: 'Flow' } };
          const fields = ['schemes', 'consumes', 'produces'];
          const swagger = new ObjectElement({ swagger: '2.0' });
          for (const field of fields) {
            const array = new ArrayElement(['value1', 'value2']);
            array.style = { ...style };
            swagger.set(field, array);
          }

          const swaggerElement = refractSwagger(swagger) as SwaggerElement;

          for (const field of fields) {
            assert.deepEqual((swaggerElement.get(field) as ArrayElement).style, style, field);
          }
        });
      });
    });
  });
});
