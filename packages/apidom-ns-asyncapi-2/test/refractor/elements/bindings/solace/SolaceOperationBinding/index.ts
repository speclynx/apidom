import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSolaceOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SolaceOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const solaceOperationBindingElement = refractSolaceOperationBinding({
          bindingVersion: '0.2.0',
          destinations: [{}],
        });

        expect(sexprs(solaceOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
