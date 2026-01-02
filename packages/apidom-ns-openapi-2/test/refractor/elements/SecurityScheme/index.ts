import { expect, assert } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractSecurityScheme, SecuritySchemeElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SecuritySchemeElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const securitySchemeElement = refractSecurityScheme({
          type: 'apiKey',
          description: 'simple description',
          name: 'api_key',
          in: 'header',
          flow: 'implicit',
          authorizationUrl: 'https://swagger.io/api/oauth/dialog',
          tokenUrl: 'https://swagger.io/api/oauth/token-url',
          scopes: {
            'write:pets': 'modify pets in your account',
            'read:pets': 'read your pets',
          },
        });

        expect(sexprs(securitySchemeElement)).toMatchSnapshot();
      });

      specify('should support specification extensions', function () {
        const securitySchemeElement = refractSecurityScheme({
          type: 'apiKey',
          'x-extension': 'extension',
        }) as SecuritySchemeElement;

        assert.isFalse(
          includesClasses(securitySchemeElement.getMember('type') as any, [
            'specification-extension',
          ]),
        );
        assert.isTrue(
          includesClasses(securitySchemeElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });
    });
  });
});
