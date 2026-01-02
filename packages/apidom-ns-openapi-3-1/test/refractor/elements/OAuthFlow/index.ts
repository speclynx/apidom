import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractOAuthFlow } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('OAuthFlowElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const oauthFlowElement = refractOAuthFlow({
          authorizationUrl: 'http://example.com/authorizatin-url',
          tokenUrl: 'http://example.com/token-url',
          refreshUrl: 'http://example.com/refresh-url',
          scopes: {
            string: 'string',
          },
        });

        expect(sexprs(oauthFlowElement)).toMatchSnapshot();
      });
    });
  });
});
