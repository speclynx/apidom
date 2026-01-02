import { assert, expect } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractResponses, ResponsesElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ResponsesElement', function () {
      context('given all fields of type ResponseElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const responsesElement = refractResponses({
            '200': {},
            default: {},
          });

          expect(sexprs(responsesElement)).toMatchSnapshot();
        });
      });

      context('given all fields of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const responsesElement = refractResponses({
            default: { $ref: '#/components/responses/Response1' },
            '200': { $ref: '#/components/responses/Response1' },
          });

          expect(sexprs(responsesElement)).toMatchSnapshot();
        });
      });
    });

    context('given unrecognized fields', function () {
      specify('should refract values to generic ApiDOM tree', function () {
        const responsesElement = refractResponses({
          '600': {},
          XXX: {},
        });

        expect(sexprs(responsesElement)).toMatchSnapshot();
      });
    });

    specify('should support specification extensions', function () {
      const responsesElement = refractResponses({
        default: {},
        'x-extension': 'extension',
      }) as ResponsesElement;

      assert.isFalse(
        includesClasses(responsesElement.getMember('default') as any, ['specification-extension']),
      );
      assert.isTrue(
        includesClasses(responsesElement.getMember('x-extension') as any, [
          'specification-extension',
        ]),
      );
    });
  });
});
