import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSolaceChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SolaceChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const solaceChannelBindingElement = refractSolaceChannelBinding({});

        expect(sexprs(solaceChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
