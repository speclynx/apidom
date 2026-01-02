import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractJmsChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('JmsChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const jmsChannelBindingElement = refractJmsChannelBinding({});

        expect(sexprs(jmsChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
