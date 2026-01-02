import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractStompOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('StompOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const stompOperationBindingElement = refractStompOperationBinding({});

        expect(sexprs(stompOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
