import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractComponents } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ComponentsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const componentsElement = refractComponents({
          inputs: {
            userInput: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                },
              },
            },
          },
          parameters: {
            userIdParam: {
              name: 'userId',
              in: 'header',
              value: '{$inputs.userId}',
            },
          },
          successActions: {
            completeAction: {
              name: 'complete',
              type: 'end',
            },
          },
          failureActions: {
            retryAction: {
              name: 'retry',
              type: 'retry',
              retryAfter: 1000,
              retryLimit: 3,
            },
          },
        });

        expect(sexprs(componentsElement)).toMatchSnapshot();
      });
    });
  });
});
