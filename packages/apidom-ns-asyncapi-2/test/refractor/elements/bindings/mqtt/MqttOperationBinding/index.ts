import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMqttOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('MqttOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mqttOperationBindingElement = refractMqttOperationBinding({
          qos: 2,
          retain: true,
          bindingVersion: '0.1.0',
        });

        expect(sexprs(mqttOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
