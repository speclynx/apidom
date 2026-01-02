import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAmqpServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AmqpServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const amqpServerBindingElement = refractAmqpServerBinding({});

        expect(sexprs(amqpServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
