import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { CriterionExpressionTypeElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('CriterionExpressionTypeElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const criterionExpressionTypeElement = CriterionExpressionTypeElement.refract({
          type: 'jsonpath',
          version: 'draft-goessner-dispatch-jsonpath-00',
        });

        expect(sexprs(criterionExpressionTypeElement)).toMatchSnapshot();
      });
    });
  });
});
