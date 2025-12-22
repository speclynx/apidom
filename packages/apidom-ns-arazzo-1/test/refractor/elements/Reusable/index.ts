import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { ReusableElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ReusableElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const reusableElement = ReusableElement.refract({
          reference: '#/path/to/somewhere',
          value: 'override',
        });

        expect(sexprs(reusableElement)).toMatchSnapshot();
      });
    });
  });
});
