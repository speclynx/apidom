import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMercureChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('MercureChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mercureChannelBindingElement = refractMercureChannelBinding({});

        expect(sexprs(mercureChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
