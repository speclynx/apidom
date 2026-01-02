import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractWebSocketMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('WebSocketMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const webSocketMessageBindingElement = refractWebSocketMessageBinding({});

        expect(sexprs(webSocketMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
