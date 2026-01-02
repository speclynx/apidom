import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAsyncApiVersion } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AsyncApiVersionElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const asyncApiVersion = refractAsyncApiVersion('2.6.0');

        expect(sexprs(asyncApiVersion)).toMatchSnapshot();
      });
    });
  });
});
