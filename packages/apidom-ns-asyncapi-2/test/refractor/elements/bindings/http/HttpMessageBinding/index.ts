import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractHttpMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('HttpMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const httpMessageBindingElement = refractHttpMessageBinding({
          headers: {},
          bindingVersion: '0.1.0',
        });

        expect(sexprs(httpMessageBindingElement)).toMatchSnapshot();
      });

      context('given query field of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const httpMessageBindingElement = refractHttpMessageBinding({
            headers: {
              $ref: '#/pointer',
            },
            bindingVersion: '0.1.0',
          });

          expect(sexprs(httpMessageBindingElement)).toMatchSnapshot();
        });
      });
    });
  });
});
