import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractExample } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ExampleElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const exampleElement = refractExample({
          'application/json': {
            name: 'Puma',
            type: 'Dog',
            color: 'Black',
            gender: 'Female',
            breed: 'Mixed',
          },
        });

        expect(sexprs(exampleElement)).toMatchSnapshot();
      });
    });
  });
});
