import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractIdentifier } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('IdentifierElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const identifierElement = refractIdentifier('urn:com:smartylighting:streetlights:server');

        expect(sexprs(identifierElement)).toMatchSnapshot();
      });
    });
  });
});
