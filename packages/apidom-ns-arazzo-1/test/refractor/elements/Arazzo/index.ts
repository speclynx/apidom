import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractArazzo } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ArazzoElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const arazzoElement = refractArazzo('1.0.0');

        expect(sexprs(arazzoElement)).toMatchSnapshot();
      });
    });
  });
});
