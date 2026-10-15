import { assert, expect } from 'chai';
import { sexprs, toValue } from '@speclynx/apidom-core';
import { includesClasses } from '@speclynx/apidom-datamodel';

import { refractOverlay1, refractReusableActionReference } from '../../../../src/index.ts';

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

      context('given in Overlay actions', function () {
        specify('should annotate with referenced-element meta', function () {
          const overlay1Element = refractOverlay1({
            overlay: '1.2.0',
            actions: [
              { $ref: '#/components/actions/errorResponse', target: '$.info' },
              { target: '$.info', remove: true },
            ],
          });
          const [referenceElement, actionElement] = overlay1Element.actions!;

          assert.strictEqual(
            toValue(referenceElement.meta.get('referenced-element')),
            'reusableAction',
          );
          assert.isFalse(actionElement.meta.hasKey('referenced-element'));
        });
      });
    });
  });
});
