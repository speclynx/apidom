import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSnsOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SnsOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const snsOperationBindingElement = refractSnsOperationBinding({});

        expect(sexprs(snsOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
