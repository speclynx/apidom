import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import {
  refractPayloadReplacement,
  isExpressionTypeElement,
  isSelectorElement,
  PayloadReplacementElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('PayloadReplacementElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const payloadReplacementElement = refractPayloadReplacement({
          target: '$.user.id',
          targetSelectorType: 'jsonpath',
          value: '{$response.body#/userId}',
        });

        expect(sexprs(payloadReplacementElement)).toMatchSnapshot();
      });

      context(
        'given targetSelectorType of Expression Type Object shape and Selector value',
        function () {
          specify('should refract to ExpressionTypeElement and SelectorElement', function () {
            const payloadReplacementElement = refractPayloadReplacement<PayloadReplacementElement>({
              target: '/Envelope/Header/CustomerId',
              targetSelectorType: { type: 'xpath', version: 'xpath-30' },
              value: {
                context: '$steps.fetchCustomerData.outputs.xml',
                selector: '/CustomerInfo/Id',
                type: { type: 'xpath', version: 'xpath-30' },
              },
            });

            assert.isTrue(isExpressionTypeElement(payloadReplacementElement.targetSelectorType));
            assert.isTrue(isSelectorElement(payloadReplacementElement.value));
            expect(sexprs(payloadReplacementElement)).toMatchSnapshot();
          });
        },
      );
    });
  });
});
