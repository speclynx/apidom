import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractDefinitions } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('DefinitionsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const definitionsElement = refractDefinitions({
          schema: {},
          jsonReference: { $ref: '#/pointer' },
        });

        expect(sexprs(definitionsElement)).toMatchSnapshot();
      });
    });
  });
});
