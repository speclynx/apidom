import { assert, expect } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractPathItem, PathItemElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('PathItemElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const pathItemElement = refractPathItem({
          $ref: 'https://example.com/PathItem1',
          get: {},
          put: {},
          post: {},
          delete: {},
          options: {},
          head: {},
          patch: {},
          parameters: [{}, { $ref: '#/components/parameters/Parameter1' }],
        });

        expect(sexprs(pathItemElement)).toMatchSnapshot();
      });

      specify('should support specification extensions', function () {
        const pathItemElement = refractPathItem({
          get: {},
          'x-extension': 'extension',
        }) as PathItemElement;

        assert.isFalse(
          includesClasses(pathItemElement.getMember('get') as any, ['specification-extension']),
        );
        assert.isTrue(
          includesClasses(pathItemElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });
    });
  });
});
