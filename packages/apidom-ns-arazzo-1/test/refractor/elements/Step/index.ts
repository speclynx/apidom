import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import {
  refractStep,
  isExpressionTypeElement,
  isSelectorElement,
  isStepDependsOnElement,
  SelectorElement,
  StepElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('StepElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const stepElement = refractStep({
          description: 'Search for available pets',
          stepId: 'searchForPet',
          operationId: 'getPets',
          operationPath: '{$sourceDescriptions.petstore}/pets',
          channelPath: '{$sourceDescriptions.asyncOrderApi.url}#/channels/~1orders',
          workflowId: 'uniqueWorkflowId',
          parameters: [
            {
              name: 'status',
              in: 'query',
              value: 'available',
            },
            {
              reference: '#/components/parameters/userId',
              value: '{$inputs.userId}',
            },
          ],
          requestBody: {
            contentType: 'application/json',
            payload: {
              status: 'available',
            },
            replacements: [
              {
                target: '$.status',
                value: '{$inputs.status}',
              },
            ],
          },
          successCriteria: [
            {
              context: '$statusCode',
              condition: '200',
              type: 'simple',
            },
          ],
          onSuccess: [
            {
              name: 'onSuccessAction',
              type: 'goto',
              workflowId: 'uniqueWorkflowId',
              stepId: 'getPetStep',
              criteria: [
                {
                  context: '$statusCode',
                  condition: '^200$',
                  type: 'regex',
                },
              ],
            },
          ],
          onFailure: [
            {
              name: 'onFailureAction',
              type: 'retry',
              workflowId: 'uniqueWorkflowId',
              stepId: 'getPetStep',
              retryAfter: 500,
              retryLimit: 5,
              criteria: [
                {
                  context: '$statusCode',
                  condition: '^503$',
                  type: 'regex',
                },
              ],
            },
          ],
          outputs: {
            petList: '$response.body',
          },
          timeout: 6000,
          correlationId: '$inputs.correlationId',
          action: 'receive',
          dependsOn: ['placeOrder', '$workflows.other.steps.authStep'],
        });

        expect(sexprs(stepElement)).toMatchSnapshot();
      });

      context('given dependsOn field', function () {
        specify('should refract to StepDependsOnElement', function () {
          const stepElement = refractStep<StepElement>({
            stepId: 'confirmOrder',
            dependsOn: ['placeOrder'],
          });

          assert.isTrue(isStepDependsOnElement(stepElement.dependsOn));
        });
      });

      context('given outputs with Selector Object values', function () {
        specify('should refract Selector Object shaped values to SelectorElement', function () {
          const stepElement = refractStep<StepElement>({
            stepId: 'getUser',
            outputs: {
              userEmail: {
                context: '$response.body',
                selector: '$.user.profile.email',
                type: 'jsonpath',
              },
              rawBody: '$response.body',
            },
          });

          assert.isTrue(isSelectorElement(stepElement.outputs!.get('userEmail')));
          assert.isFalse(isSelectorElement(stepElement.outputs!.get('rawBody')));
          expect(sexprs(stepElement)).toMatchSnapshot();
        });

        specify('should refract Selector Object type of Expression Type Object shape', function () {
          const stepElement = refractStep<StepElement>({
            stepId: 'getInvoice',
            outputs: {
              invoiceNumber: {
                context: '$response.body',
                selector: '/Invoice/Header/InvoiceNumber',
                type: { type: 'xpath', version: 'xpath-30' },
              },
            },
          });
          const selectorElement = stepElement.outputs!.get('invoiceNumber') as SelectorElement;

          assert.isTrue(isSelectorElement(selectorElement));
          assert.isTrue(isExpressionTypeElement(selectorElement.type));
        });
      });
    });
  });
});
