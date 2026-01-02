import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractCriterionExpressionType } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('CriterionExpressionTypeElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const criterionExpressionTypeElement = refractCriterionExpressionType({
          type: 'jsonpath',
          version: 'draft-goessner-dispatch-jsonpath-00',
        });

        expect(sexprs(criterionExpressionTypeElement)).toMatchSnapshot();
      });
    });
  });
});
