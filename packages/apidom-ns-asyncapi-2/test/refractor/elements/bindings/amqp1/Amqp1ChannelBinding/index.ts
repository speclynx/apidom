import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAmqp1ChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('Amqp1ChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const amqp1ChannelBindingElement = refractAmqp1ChannelBinding({});

        expect(sexprs(amqp1ChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
