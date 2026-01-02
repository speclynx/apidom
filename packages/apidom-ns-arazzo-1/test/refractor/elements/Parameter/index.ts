import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractParameter } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ParameterElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const parameterElement = refractParameter({
          name: 'userId',
          in: 'header',
          value: '{$inputs.userId}',
        });

        expect(sexprs(parameterElement)).toMatchSnapshot();
      });
    });
  });
});
