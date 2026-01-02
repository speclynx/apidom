import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSqsMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SqsMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const sqsMessageBindingElement = refractSqsMessageBinding({});

        expect(sexprs(sqsMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
