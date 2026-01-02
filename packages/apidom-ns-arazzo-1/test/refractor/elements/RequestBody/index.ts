import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractRequestBody } from '../../../../src/index.ts';

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
    });
  });
});
