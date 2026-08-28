import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import {
  refractRequestBody,
  isSelectorElement,
  RequestBodyElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('RequestBodyElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const requestBodyElement = refractRequestBody({
          contentType: 'application/json',
          payload: { user: 'test' },
          replacements: [
            {
              target: '$.user',
              value: '{$response.body#/username}',
            },
          ],
        });

        expect(sexprs(requestBodyElement)).toMatchSnapshot();
      });

      context('given payload containing nested Selector Objects', function () {
        specify('should refract Selector Object shaped values to SelectorElement', function () {
          const requestBodyElement = refractRequestBody<RequestBodyElement>({
            contentType: 'application/json',
            payload: {
              invoiceId: {
                context: '$steps.fetchXml.outputs.invoiceXml',
                selector: '/Invoice/Header/InvoiceNumber',
                type: 'xpath',
              },
              items: [
                {
                  context: '$inputs.order',
                  selector: '$.items[0]',
                  type: 'jsonpath',
                },
                { sku: 'ABC123' },
              ],
              note: 'literal',
            },
          });
          const payload = requestBodyElement.payload as any; // eslint-disable-line @typescript-eslint/no-explicit-any

          assert.isTrue(isSelectorElement(payload.get('invoiceId')));
          assert.isTrue(isSelectorElement(payload.get('items').get(0)));
          assert.isFalse(isSelectorElement(payload.get('items').get(1)));
          expect(sexprs(requestBodyElement)).toMatchSnapshot();
        });
      });

      context('given consume option', function () {
        specify('should refract nested Selector Objects in place', function () {
          const requestBodyElement = refractRequestBody<RequestBodyElement>(
            {
              payload: {
                items: [{ context: '$inputs.order', selector: '$.items[0]', type: 'jsonpath' }],
              },
            },
            { consume: true },
          );
          const payload = requestBodyElement.payload as any; // eslint-disable-line @typescript-eslint/no-explicit-any

          assert.isTrue(isSelectorElement(payload.get('items').get(0)));
        });
      });

      context('given payload of Selector Object shape', function () {
        specify('should refract to SelectorElement', function () {
          const requestBodyElement = refractRequestBody<RequestBodyElement>({
            payload: {
              context: '$steps.getInventory.outputs.payload',
              selector: '$.body',
              type: 'jsonpath',
            },
          });

          assert.isTrue(isSelectorElement(requestBodyElement.payload));
        });
      });
    });
  });
});
