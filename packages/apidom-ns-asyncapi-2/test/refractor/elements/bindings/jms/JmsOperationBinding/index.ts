import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractJmsOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('JmsOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const jmsOperationBindingElement = refractJmsOperationBinding({});

        expect(sexprs(jmsOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
