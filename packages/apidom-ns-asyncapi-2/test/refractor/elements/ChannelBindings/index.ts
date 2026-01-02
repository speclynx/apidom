import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractChannelBindings } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ChannelBindingsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const channelBindingsElement = refractChannelBindings({
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

        expect(sexprs(channelBindingsElement)).toMatchSnapshot();
      });
    });
  });
});
