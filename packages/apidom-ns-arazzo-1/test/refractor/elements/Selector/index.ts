import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import {
  refractSelector,
  isExpressionTypeElement,
  SelectorElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SelectorElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const selectorElement = refractSelector({
          context: '$response.body',
          selector: '$.user.profile.email',
          type: 'jsonpath',
        });

        expect(sexprs(selectorElement)).toMatchSnapshot();
      });

      context('given type field of Expression Type Object shape', function () {
        specify('should refract to ExpressionTypeElement', function () {
          const selectorElement = refractSelector<SelectorElement>({
            context: '$steps.fetchXml.outputs.invoiceXml',
            selector: '/Invoice/Header/InvoiceNumber',
            type: { type: 'xpath', version: 'xpath-30' },
          });

          assert.isTrue(isExpressionTypeElement(selectorElement.type));
          expect(sexprs(selectorElement)).toMatchSnapshot();
        });
      });
    });
  });
});
