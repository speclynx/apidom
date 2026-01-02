import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractParametersDefinitions } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ParametersDefinitionsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const parametersDefinitionsElement = refractParametersDefinitions({
          parameter1: {},
          parameter2: {},
        });

        expect(sexprs(parametersDefinitionsElement)).toMatchSnapshot();
      });
    });
  });
});
