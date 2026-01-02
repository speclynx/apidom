import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractFailureAction } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('FailureActionElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const failureActionElement = refractFailureAction({
          name: 'failureAction',
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
        });

        expect(sexprs(failureActionElement)).toMatchSnapshot();
      });
    });
  });
});
