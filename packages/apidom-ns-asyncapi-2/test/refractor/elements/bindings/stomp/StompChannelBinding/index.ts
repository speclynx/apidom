import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { StompChannelBindingElement } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('StompChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const stompChannelBindingElement = StompChannelBindingElement.refract({});

        expect(sexprs(stompChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
