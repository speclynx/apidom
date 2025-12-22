import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { PulsarOperationBindingElement } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('PulsarOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const pulsarOperationBindingElement = PulsarOperationBindingElement.refract({});

        expect(sexprs(pulsarOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
