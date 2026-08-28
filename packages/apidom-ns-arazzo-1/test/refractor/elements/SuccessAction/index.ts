import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import {
  refractSuccessAction,
  isSuccessActionParametersElement,
  isParameterElement,
  isReusableElement,
  SuccessActionElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SuccessActionElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const successActionElement = refractSuccessAction({
          name: 'successAction',
          type: 'goto',
          workflowId: 'uniqueWorkflowId',
          stepId: 'getPetStep',
          parameters: [
            { name: 'userId', value: '$inputs.userId' },
            { reference: '$components.parameters.sessionToken' },
          ],
          criteria: [
            {
              context: '$statusCode',
              condition: '^200$',
              type: 'regex',
            },
          ],
        });

        expect(sexprs(successActionElement)).toMatchSnapshot();
      });

      context('given parameters field', function () {
        specify('should refract to SuccessActionParametersElement', function () {
          const successActionElement = refractSuccessAction<SuccessActionElement>({
            name: 'action',
            type: 'goto',
            workflowId: 'uniqueWorkflowId',
            parameters: [
              { name: 'userId', value: '$inputs.userId' },
              { reference: '$components.parameters.sessionToken' },
            ],
          });

          assert.isTrue(isSuccessActionParametersElement(successActionElement.parameters));
          assert.isTrue(isParameterElement(successActionElement.parameters!.get(0)));
          assert.isTrue(isReusableElement(successActionElement.parameters!.get(1)));
        });
      });
    });
  });
});
