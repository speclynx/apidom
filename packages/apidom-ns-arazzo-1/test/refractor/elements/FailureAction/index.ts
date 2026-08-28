import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import {
  refractFailureAction,
  isFailureActionParametersElement,
  isParameterElement,
  isReusableElement,
  FailureActionElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('FailureActionElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const failureActionElement = refractFailureAction({
          name: 'failureAction',
          type: 'retry',
          workflowId: 'uniqueWorkflowId',
          stepId: 'getPetStep',
          parameters: [
            { name: 'userId', value: '$inputs.userId' },
            { reference: '$components.parameters.sessionToken' },
          ],
          retryAfter: 500,
          retryLimit: 5,
          criteria: [
            {
              context: '$statusCode',
              condition: '^503$',
              type: 'regex',
            },
          ],
        });

        expect(sexprs(failureActionElement)).toMatchSnapshot();
      });

      context('given parameters field', function () {
        specify('should refract to FailureActionParametersElement', function () {
          const failureActionElement = refractFailureAction<FailureActionElement>({
            name: 'action',
            type: 'goto',
            workflowId: 'uniqueWorkflowId',
            parameters: [
              { name: 'userId', value: '$inputs.userId' },
              { reference: '$components.parameters.sessionToken' },
            ],
          });

          assert.isTrue(isFailureActionParametersElement(failureActionElement.parameters));
          assert.isTrue(isParameterElement(failureActionElement.parameters!.get(0)));
          assert.isTrue(isReusableElement(failureActionElement.parameters!.get(1)));
        });
      });
    });
  });
});
