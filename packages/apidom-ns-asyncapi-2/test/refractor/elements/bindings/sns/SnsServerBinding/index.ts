import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSnsServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SnsServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const snsServerBindingElement = refractSnsServerBinding({});

        expect(sexprs(snsServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
