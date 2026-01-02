import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSolaceServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SolaceServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const solaceServerBindingElement = refractSolaceServerBinding({
          bindingVersion: '0.2.0',
          msgVpn: 'network1',
        });

        expect(sexprs(solaceServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
