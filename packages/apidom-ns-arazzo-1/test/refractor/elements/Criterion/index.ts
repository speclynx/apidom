import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import {
  refractCriterion,
  isExpressionTypeElement,
  CriterionElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('CriterionElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const criterionElement = refractCriterion({
          context: '$statusCode',
          condition: '^200$',
          type: 'regex',
        });

        expect(sexprs(criterionElement)).toMatchSnapshot();
      });

      context('given type field of Expression Type Object shape', function () {
        specify('should refract to ExpressionTypeElement', function () {
          const criterionElement = refractCriterion<CriterionElement>({
            context: '$response.body',
            condition: '$[?count(@.pets) > 0]',
            type: { type: 'jsonpath', version: 'rfc9535' },
          });

          assert.isTrue(isExpressionTypeElement(criterionElement.type));
          expect(sexprs(criterionElement)).toMatchSnapshot();
        });
      });
    });
  });
});
