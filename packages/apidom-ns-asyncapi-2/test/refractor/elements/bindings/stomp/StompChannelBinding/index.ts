import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractStompChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('StompChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const stompChannelBindingElement = refractStompChannelBinding({});

        expect(sexprs(stompChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
