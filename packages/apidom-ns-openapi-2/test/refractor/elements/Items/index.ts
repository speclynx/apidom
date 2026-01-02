import { assert, expect } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractItems, ItemsElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ItemsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const itemsElement = refractItems({
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

        expect(sexprs(itemsElement)).toMatchSnapshot();
      });

      specify('should support specification extensions', function () {
        const itemsElement = refractItems({
          type: 'array',
          'x-extension': 'extension',
        }) as ItemsElement;

        assert.isFalse(
          includesClasses(itemsElement.getMember('type') as any, ['specification-extension']),
        );
        assert.isTrue(
          includesClasses(itemsElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });
    });
  });
});
