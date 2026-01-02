import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMercureOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('MercureOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mercureOperationBindingElement = refractMercureOperationBinding({});

        expect(sexprs(mercureOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
