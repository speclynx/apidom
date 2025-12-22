import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { StepElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('StepElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const stepElement = StepElement.refract({
          description: 'Search for available pets',
          stepId: 'searchForPet',
          operationId: 'getPets',
          operationPath: '{$sourceDescriptions.petstore}/pets',
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
        });

        expect(sexprs(stepElement)).toMatchSnapshot();
      });
    });
  });
});
