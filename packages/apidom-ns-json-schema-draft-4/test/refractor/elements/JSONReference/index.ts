import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractJSONReference } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('JSONReference', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const jsonReferenceElement = refractJSONReference({
          $ref: 'https://example.com/#/json/pointer',
        });

        expect(sexprs(jsonReferenceElement)).toMatchSnapshot();
      });
    });
  });
});
