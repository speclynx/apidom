import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractStompMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('StompMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const stompMessageBindingElement = refractStompMessageBinding({});

        expect(sexprs(stompMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
