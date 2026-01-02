import { assert, expect } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractResponse, ResponseElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ResponseElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const responseElement = refractResponse({
          description: 'response description',
          schema: {},
          headers: {},
          examples: {},
        });

        expect(sexprs(responseElement)).toMatchSnapshot();
      });

      context('given schema keyword in form of object with $ref property', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const responseElement = refractResponse({
            schema: { $ref: '#/pointer' },
          });

          expect(sexprs(responseElement)).toMatchSnapshot();
        });
      });

      specify('should support specification extensions', function () {
        const responseElement = refractResponse({
          description: 'response description',
          'x-extension': 'extension',
        }) as ResponseElement;

        assert.isFalse(
          includesClasses(responseElement.getMember('description') as any, [
            'specification-extension',
          ]),
        );
        assert.isTrue(
          includesClasses(responseElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });
    });
  });
});
