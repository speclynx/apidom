import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { SqsMessageBindingElement } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SqsMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const sqsMessageBindingElement = SqsMessageBindingElement.refract({});

        expect(sexprs(sqsMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
