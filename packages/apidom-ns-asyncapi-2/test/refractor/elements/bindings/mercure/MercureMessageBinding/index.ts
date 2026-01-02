import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMercureMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('MercureMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mercureMessageBindingElement = refractMercureMessageBinding({});

        expect(sexprs(mercureMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
