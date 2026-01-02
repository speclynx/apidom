import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMedia } from '@speclynx/apidom-ns-json-schema-draft-4';

describe('refractor', function () {
  context('elements', function () {
    context('Media', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const mediaElement = refractMedia({
          binaryEncoding: 'base64',
          type: 'image/png',
        });

        expect(sexprs(mediaElement)).toMatchSnapshot();
      });
    });
  });
});
