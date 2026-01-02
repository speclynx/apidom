import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMqttMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('MqttMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mqttMessageBindingElement = refractMqttMessageBinding({
          bindingVersion: '0.1.0',
        });

        expect(sexprs(mqttMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
