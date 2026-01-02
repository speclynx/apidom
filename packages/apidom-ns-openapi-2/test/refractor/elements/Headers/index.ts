import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractHeaders } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('HeadersElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const headersElement = refractHeaders({
          header1: {},
          header2: {},
        });

        expect(sexprs(headersElement)).toMatchSnapshot();
      });
    });
  });
});
