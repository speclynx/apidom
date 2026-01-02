import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractStompServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('StompServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const stompServerBindingElement = refractStompServerBinding({});

        expect(sexprs(stompServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
