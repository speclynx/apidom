import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSecurityRequirement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SecurityRequirementElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const securityRequirementElement = refractSecurityRequirement({
          petstore_auth: ['write:pets', 'read:pets'],
        });

        expect(sexprs(securityRequirementElement)).toMatchSnapshot();
      });
    });
  });
});
