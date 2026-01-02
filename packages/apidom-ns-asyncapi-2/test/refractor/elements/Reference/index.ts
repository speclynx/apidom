import { assert, expect } from 'chai';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { sexprs, toValue } from '@speclynx/apidom-core';

import { refractReference, ReferenceElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ReferenceElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const referenceElement = refractReference({
          $ref: '#/path/to/somewhere',
        });

        expect(sexprs(referenceElement)).toMatchSnapshot();
      });

      context('given generic ApiDOM element', function () {
        let referenceElement: ReferenceElement;

        beforeEach(function () {
          referenceElement = refractReference(
            new ObjectElement(
              { $ref: '#/path/to/somewhere' },
              { classes: ['example'] },
              { attr: true },
            ),
          ) as ReferenceElement;
        });

        specify('should refract to semantic ApiDOM tree', function () {
          expect(sexprs(referenceElement)).toMatchSnapshot();
        });

        specify('should deepmerge meta', function () {
          assert.deepEqual(toValue(referenceElement.meta), {
            classes: ['json-reference', 'asyncapi-reference', 'example', 'reference-element'],
          });
        });

        specify('should deepmerge attributes', function () {
          assert.isTrue(referenceElement.attributes.get('attr')?.equals(true));
        });
      });
    });
  });
});
