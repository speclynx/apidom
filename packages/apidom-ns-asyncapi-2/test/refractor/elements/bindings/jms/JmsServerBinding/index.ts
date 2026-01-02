import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractJmsServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('JmsServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const jmsServerBindingElement = refractJmsServerBinding({});

        expect(sexprs(jmsServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
