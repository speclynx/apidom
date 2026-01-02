import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractParameters } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ParametersElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const parametersElement = refractParameters({
          userId: {},
          orderId: {},
        });

        expect(sexprs(parametersElement)).toMatchSnapshot();
      });
    });

    context('given field is of type ReferenceElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const parametersElement = refractParameters({
          userId: {},
          orderId: {
            $ref: '#/path/to/parameter',
          },
        });

        expect(sexprs(parametersElement)).toMatchSnapshot();
      });
    });
  });
});
