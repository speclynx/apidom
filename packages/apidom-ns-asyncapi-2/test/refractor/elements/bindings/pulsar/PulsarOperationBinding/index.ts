import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractPulsarOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('PulsarOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const pulsarOperationBindingElement = refractPulsarOperationBinding({});

        expect(sexprs(pulsarOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
