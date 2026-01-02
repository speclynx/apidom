import { expect, assert } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractScopes, ScopesElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ScopesElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const scopesElement = refractScopes({
          'write:pets': 'modify pets in your account',
          'read:pets': 'read your pets',
          'x-extension': 'extension',
        });

        expect(sexprs(scopesElement)).toMatchSnapshot();
      });

      specify('should support specification extensions', function () {
        const scopesElement = refractScopes({
          'write:pets': 'modify pets in your account',
          'read:pets': 'read your pets',
          'x-extension': 'extension',
        }) as ScopesElement;

        assert.isFalse(
          includesClasses(scopesElement.getMember('write:pets') as any, [
            'specification-extension',
          ]),
        );
        assert.isTrue(
          includesClasses(scopesElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });
    });
  });
});
