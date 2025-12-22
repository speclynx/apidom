import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { WorkflowElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('WorkflowElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const workflowElement = WorkflowElement.refract({
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
    });
  });
});
