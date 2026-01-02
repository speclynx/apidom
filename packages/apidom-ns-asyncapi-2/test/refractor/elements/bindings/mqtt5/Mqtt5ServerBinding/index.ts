import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMqtt5ServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('Mqtt5ServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mqtt5ServerBindingElement = refractMqtt5ServerBinding({});

        expect(sexprs(mqtt5ServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
