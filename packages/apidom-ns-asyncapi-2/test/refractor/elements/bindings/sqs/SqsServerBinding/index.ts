import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSqsServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SqsServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const sqsServerBindingElement = refractSqsServerBinding({});

        expect(sexprs(sqsServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
