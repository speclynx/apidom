import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractReference } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ReferenceElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const referenceElement = refractReference({
          $ref: '#/path/to/somewhere',
        });

        expect(sexprs(referenceElement)).toMatchSnapshot();
      });
    });
  });
});
