import { assert, expect } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractParameter, ParameterElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ParameterElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const parameterElement = refractParameter({
          type: 'array',
          name: 'user',
          in: 'body',
          description: 'user to add to the system',
          required: true,
          schema: {},
          items: {},
        });

        expect(sexprs(parameterElement)).toMatchSnapshot();
      });

      context('given schema keyword in form of object with $ref property', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const parameterElement = refractParameter({
            schema: { $ref: '#/pointer' },
          });

          expect(sexprs(parameterElement)).toMatchSnapshot();
        });
      });

      specify('should support specification extensions', function () {
        const parameterElement = refractParameter({
          type: 'array',
          'x-extension': 'extension',
        }) as ParameterElement;

        assert.isFalse(
          includesClasses(parameterElement.getMember('type') as any, ['specification-extension']),
        );
        assert.isTrue(
          includesClasses(parameterElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });
    });
  });
});
