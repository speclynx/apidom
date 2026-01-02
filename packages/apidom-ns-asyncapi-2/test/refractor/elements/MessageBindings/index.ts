import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMessageBindings } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('MessageBindingsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const messageBindingsElement = refractMessageBindings({
          http: {},
          ws: {},
          kafka: {},
          anypointmq: {},
          amqp: {},
          amqp1: {},
          mqtt: {},
          mqtt5: {},
          nats: {},
          jms: {},
          sns: {},
          solace: {},
          sqs: {},
          stomp: {},
          redis: {},
          mercure: {},
          ibmmq: {},
          googlepubsub: {},
          pulsar: {},
        });

        expect(sexprs(messageBindingsElement)).toMatchSnapshot();
      });
    });
  });
});
