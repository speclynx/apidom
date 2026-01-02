import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractIbmmqOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('IbmmqOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const ibmmqOperationBindingElement = refractIbmmqOperationBinding({});

        expect(sexprs(ibmmqOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
