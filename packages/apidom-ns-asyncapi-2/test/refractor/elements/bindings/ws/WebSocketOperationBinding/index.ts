import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractWebSocketOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('WebSocketOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const webSocketOperationBindingElement = refractWebSocketOperationBinding({});

        expect(sexprs(webSocketOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
