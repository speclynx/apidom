import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMqtt5OperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('Mqtt5OperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mqtt5OperationBindingElement = refractMqtt5OperationBinding({});

        expect(sexprs(mqtt5OperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
