import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractOperationBindings } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('OperationBindingsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const operationBindingsElement = refractOperationBindings({
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
          googlepubsub: {},
          ibmmq: {},
          pulsar: {},
        });

        expect(sexprs(operationBindingsElement)).toMatchSnapshot();
      });
    });
  });
});
