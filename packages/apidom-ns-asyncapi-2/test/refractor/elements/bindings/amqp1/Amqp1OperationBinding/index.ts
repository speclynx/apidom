import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAmqp1OperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('Amqp1OperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const amqp1OperationBindingElement = refractAmqp1OperationBinding({});

        expect(sexprs(amqp1OperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
