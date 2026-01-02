import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAmqp1MessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('Amqp1MessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const amqp1MessageBindingElement = refractAmqp1MessageBinding({});

        expect(sexprs(amqp1MessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
