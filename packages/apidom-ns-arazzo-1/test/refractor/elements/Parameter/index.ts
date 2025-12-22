import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { ParameterElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ParameterElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const parameterElement = ParameterElement.refract({
          name: 'userId',
          in: 'header',
          value: '{$inputs.userId}',
        });

        expect(sexprs(parameterElement)).toMatchSnapshot();
      });
    });
  });
});
