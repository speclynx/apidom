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

      context('given Overlay 1.2.0 document', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const overlay1Element = refractOverlay1({
            overlay: '1.2.0',
            $self: 'https://example.com/overlays/petstore.overlay.yaml',
            info: {},
            extends: '../openapi/petstore.yaml',
            actions: [
              { target: '$.info', update: { 'x-overlay-applied': true } },
              { $ref: '#/components/actions/errorResponse', target: '$.paths.*.get.responses' },
            ],
            components: {
              actions: {
                errorResponse: {
                  fields: { update: { '404': { description: 'Not Found' } } },
                },
              },
            },
          });

          expect(sexprs(overlay1Element)).toMatchSnapshot();
        });
      });
    });
  });
});
