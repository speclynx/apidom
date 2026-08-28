import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractWorkflow, isSelectorElement, WorkflowElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('WorkflowElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const workflowElement = refractWorkflow({
          workflowId: 'uniqueWorkflowId',
          summary: 'Adopt a pet',
          description: 'Adopt a pet by calling APIs in a chain',
          inputs: {
            type: 'object',
            properties: {
              petId: {
                type: 'string',
              },
            },
          },
          dependsOn: ['previousWorkflowId'],
          steps: [
            {
              stepId: 'step1',
              operationId: 'getPet',
            },
          ],
          successActions: [
            {
              name: 'onSuccess',
              type: 'goto',
              stepId: 'nextStep',
            },
          ],
          failureActions: [
            {
              name: 'onFailure',
              type: 'end',
            },
          ],
          outputs: {
            petDetails: '$response.body',
          },
          parameters: [
            {
              name: 'userId',
              in: 'header',
              value: '{$inputs.userId}',
            },
          ],
        });

        expect(sexprs(workflowElement)).toMatchSnapshot();
      });

      context('given outputs with Selector Object values', function () {
        specify('should refract Selector Object shaped values to SelectorElement', function () {
          const workflowElement = refractWorkflow<WorkflowElement>({
            workflowId: 'uniqueWorkflowId',
            outputs: {
              orderId: {
                context: '$steps.confirmOrder.outputs.payload',
                selector: '$.orderId',
                type: 'jsonpath',
              },
            },
          });

          assert.isTrue(isSelectorElement(workflowElement.outputs!.get('orderId')));
          expect(sexprs(workflowElement)).toMatchSnapshot();
        });
      });
    });
  });
});
