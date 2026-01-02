import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractPulsarServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('PulsarServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const pulsarServerBindingElement = refractPulsarServerBinding({
          tenant: 'public',
          version: '0.1.0',
        });

        expect(sexprs(pulsarServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
