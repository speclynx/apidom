import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractCorrelationID } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('CorrelationIDElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const correlationIDElement = refractCorrelationID({
          description: 'correlation-id-description',
          location: 'correlation-id-location',
        });

        expect(sexprs(correlationIDElement)).toMatchSnapshot();
      });
    });
  });
});
