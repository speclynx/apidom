import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAmqpChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AmqpChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const amqpChannelBindingElement = refractAmqpChannelBinding({
          is: 'routingKey',
          exchange: {
            name: 'myExchange',
            type: 'topic',
            durable: true,
            autoDelete: false,
            vhost: '/',
          },
          queue: {
            name: 'my-queue-name',
            durable: true,
            exclusive: true,
            autoDelete: false,
            vhost: '/',
          },
          bindingVersion: '0.2.0',
        });

        expect(sexprs(amqpChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
