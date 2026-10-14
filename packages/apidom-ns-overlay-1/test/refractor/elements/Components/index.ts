import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractComponents } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ComponentsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const componentsElement = refractComponents({
          actions: {
            errorResponse: {
              description: 'Adds an error response',
              fields: {
                update: { '404': { description: 'Not Found' } },
              },
            },
          },
          'x-extension': 'extension',
        });

        expect(sexprs(componentsElement)).toMatchSnapshot();
      });
    });
  });
});
