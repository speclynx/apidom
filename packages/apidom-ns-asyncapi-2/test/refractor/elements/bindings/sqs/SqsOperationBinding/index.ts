import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSqsOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SqsOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const sqsOperationBindingElement = refractSqsOperationBinding({});

        expect(sexprs(sqsOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
