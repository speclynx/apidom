import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractOAuthFlows } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('OAuthFlowsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const oAuthFlowsElement = refractOAuthFlows({
          implicit: {},
          password: {},
          clientCredentials: {},
          authorizationCode: {},
        });

        expect(sexprs(oAuthFlowsElement)).toMatchSnapshot();
      });
    });
  });
});
