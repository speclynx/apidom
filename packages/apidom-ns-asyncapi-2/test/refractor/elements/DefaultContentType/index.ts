import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractDefaultContentType } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('DefaultContentTypeElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const defaultContentTypeElement = refractDefaultContentType('application/json');

        expect(sexprs(defaultContentTypeElement)).toMatchSnapshot();
      });
    });
  });
});
