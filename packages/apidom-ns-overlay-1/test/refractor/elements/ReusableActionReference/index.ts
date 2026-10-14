import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';
import { includesClasses } from '@speclynx/apidom-datamodel';

import { refractReusableActionReference } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ReusableActionReferenceElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const referenceElement = refractReusableActionReference({
          $ref: '#/components/actions/errorResponse',
          target: '$.paths.*.get.responses',
          description: 'Adds an error response to GET operations',
          'x-extension': 'extension',
        });

        expect(sexprs(referenceElement)).toMatchSnapshot();
      });

      specify('should mark $ref value with reference-value class', function () {
        const referenceElement = refractReusableActionReference({
          $ref: '#/components/actions/errorResponse',
        });

        assert.isTrue(includesClasses(referenceElement.$ref!, ['reference-value']));
      });
    });
  });
});
