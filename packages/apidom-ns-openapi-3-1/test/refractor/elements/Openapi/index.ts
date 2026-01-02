import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { OpenapiElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('OpenapiElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const openapiElement = new OpenapiElement('3.1.0');

        expect(sexprs(openapiElement)).toMatchSnapshot();
      });
    });
  });
});
