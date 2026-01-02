import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractReusable } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ReusableElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const reusableElement = refractReusable({
          reference: '#/path/to/somewhere',
          value: 'override',
        });

        expect(sexprs(reusableElement)).toMatchSnapshot();
      });
    });
  });
});
