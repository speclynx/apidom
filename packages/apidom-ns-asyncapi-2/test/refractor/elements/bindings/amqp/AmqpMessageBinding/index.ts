import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAmqpMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AmqpMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const amqpMessageBindingElement = refractAmqpMessageBinding({
          contentEncoding: 'gzip',
          messageType: 'user.signup',
          bindingVersion: '0.2.0',
        });

        expect(sexprs(amqpMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
