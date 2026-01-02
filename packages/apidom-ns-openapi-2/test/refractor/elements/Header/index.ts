import { assert, expect } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractHeader, HeaderElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('HeaderElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const headerElement = refractHeader({
          description: 'The number of allowed requests in the current period',
          type: 'array',
          items: {
            type: 'integer',
            minimum: 0,
            maximum: 63,
            items: {
              items: {
                items: {},
              },
            },
          },
        });

        expect(sexprs(headerElement)).toMatchSnapshot();
      });

      specify('should support specification extensions', function () {
        const headerElement = refractHeader({
          type: 'array',
          'x-extension': 'extension',
        }) as HeaderElement;

        assert.isFalse(
          includesClasses(headerElement.getMember('type') as any, ['specification-extension']),
        );
        assert.isTrue(
          includesClasses(headerElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });
    });
  });
});
