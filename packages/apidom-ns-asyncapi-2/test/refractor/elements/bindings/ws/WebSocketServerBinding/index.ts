import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractWebSocketServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('WebSocketServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const webSocketServerBindingElement = refractWebSocketServerBinding({});

        expect(sexprs(webSocketServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
