import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractParameter } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ParameterElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const parameterElement = refractParameter({
          description: 'parameter-description',
          location: 'parameter-location',
        });

        expect(sexprs(parameterElement)).toMatchSnapshot();
      });

      context('given schema field of type SchemaElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const parameterElement = refractParameter({
            schema: {},
          });

          expect(sexprs(parameterElement)).toMatchSnapshot();
        });
      });

      context('given schema field of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const parameterElement = refractParameter({
            schema: {
              $ref: '#/path/to/schema',
            },
          });

          expect(sexprs(parameterElement)).toMatchSnapshot();
        });
      });
    });
  });
});
