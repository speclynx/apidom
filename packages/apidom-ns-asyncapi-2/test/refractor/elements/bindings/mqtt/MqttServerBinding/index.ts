import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMqttServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('MqttServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mqttServerBindingElement = refractMqttServerBinding({
          clientId: 'guest',
          cleanSession: true,
          lastWill: {
            topic: '/last-wills',
            qos: 2,
            message: 'Guest gone offline.',
            retain: false,
          },
          keepAlive: 60,
          bindingVersion: '0.1.0',
        });

        expect(sexprs(mqttServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
