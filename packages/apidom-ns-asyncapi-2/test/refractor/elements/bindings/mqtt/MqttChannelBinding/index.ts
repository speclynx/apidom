import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { MqttChannelBindingElement } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('MqttChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mqttChannelBindingElement = MqttChannelBindingElement.refract({});

        expect(sexprs(mqttChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
