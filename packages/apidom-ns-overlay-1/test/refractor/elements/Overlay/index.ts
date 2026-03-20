import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractOverlay } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('OverlayElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const overlayElement = refractOverlay('1.1.0');

        expect(sexprs(overlayElement)).toMatchSnapshot();
      });
    });
  });
});
