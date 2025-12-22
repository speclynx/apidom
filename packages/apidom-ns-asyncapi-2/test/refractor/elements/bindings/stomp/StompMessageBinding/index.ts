import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { StompMessageBindingElement } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('StompMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const stompMessageBindingElement = StompMessageBindingElement.refract({});

        expect(sexprs(stompMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
