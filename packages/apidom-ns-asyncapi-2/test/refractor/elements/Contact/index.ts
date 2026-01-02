import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractContact } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ContactElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const contactElement = refractContact({
          name: 'API Support',
          url: 'http://www.asyncapi.org/support',
          email: 'support@asyncapi.org',
        });

        expect(sexprs(contactElement)).toMatchSnapshot();
      });
    });
  });
});
