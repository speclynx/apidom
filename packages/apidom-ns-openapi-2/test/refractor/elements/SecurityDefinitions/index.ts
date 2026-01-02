import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSecurityDefinitions } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SecurityDefinitionsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const securityDefinitionsElement = refractSecurityDefinitions({
          api_key: {},
          petstore_auth: {},
        });

        expect(sexprs(securityDefinitionsElement)).toMatchSnapshot();
      });
    });
  });
});
