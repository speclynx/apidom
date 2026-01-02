import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMqtt5ChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('Mqtt5ChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mqtt5ChannelBindingElement = refractMqtt5ChannelBinding({});

        expect(sexprs(mqtt5ChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
