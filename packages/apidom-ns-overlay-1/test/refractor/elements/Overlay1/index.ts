import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractOverlay1 } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('Overlay1Element', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const overlay1Element = refractOverlay1({
          overlay: '1.1.0',
          info: {},
          extends: 'https://example.com/openapi.json',
          actions: [{}],
        });

        expect(sexprs(overlay1Element)).toMatchSnapshot();
      });
    });
  });
});
