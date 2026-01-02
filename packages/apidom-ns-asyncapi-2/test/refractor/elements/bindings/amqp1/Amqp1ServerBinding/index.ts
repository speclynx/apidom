import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAmqp1ServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('Amqp1ServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const amqp1ServerBindingElement = refractAmqp1ServerBinding({});

        expect(sexprs(amqp1ServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
