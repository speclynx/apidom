import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractEncoding } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('EncodingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const encodingElement = refractEncoding({
          contentType: 'application/json',
          headers: {
            Header1: {},
            Header2: { $ref: '#/components/headers/Header1' },
          },
          style: 'multipart/form-data',
          explode: true,
          allowReserved: false,
        });

        expect(sexprs(encodingElement)).toMatchSnapshot();
      });
    });
  });
});
