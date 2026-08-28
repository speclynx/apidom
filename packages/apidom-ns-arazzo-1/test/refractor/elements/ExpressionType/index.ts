import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractExpressionType } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ExpressionTypeElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const expressionTypeElement = refractExpressionType({
          type: 'jsonpath',
          version: 'draft-goessner-dispatch-jsonpath-00',
        });

        expect(sexprs(expressionTypeElement)).toMatchSnapshot();
      });
    });
  });
});
