import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractHttpServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('HttpServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const httpServerBindingElement = refractHttpServerBinding({});

        expect(sexprs(httpServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
