import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMqtt5MessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('Mqtt5MessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mqtt5MessageBindingElement = refractMqtt5MessageBinding({});

        expect(sexprs(mqtt5MessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
