import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { CriterionElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('CriterionElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const criterionElement = CriterionElement.refract({
          context: '$statusCode',
          condition: '^200$',
          type: 'regex',
        });

        expect(sexprs(criterionElement)).toMatchSnapshot();
      });
    });
  });
});
