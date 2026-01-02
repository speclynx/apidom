import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMercureServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('MercureServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mercureServerBindingElement = refractMercureServerBinding({});

        expect(sexprs(mercureServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
