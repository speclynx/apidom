import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractOAuthFlows } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('OAuthFlowsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const oauthFlowsElement = refractOAuthFlows({
          implicit: {},
          password: {},
          clientCredentials: {},
          authorizationCode: {},
        });

        expect(sexprs(oauthFlowsElement)).toMatchSnapshot();
      });
    });
  });
});
