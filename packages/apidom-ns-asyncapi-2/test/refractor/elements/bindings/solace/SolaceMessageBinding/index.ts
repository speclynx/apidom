import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSolaceMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SolaceMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const solaceMessageBindingElement = refractSolaceMessageBinding({});

        expect(sexprs(solaceMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
