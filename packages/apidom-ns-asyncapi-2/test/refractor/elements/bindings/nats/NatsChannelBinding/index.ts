import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractNatsChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('NatsChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const natsChannelBindingElement = refractNatsChannelBinding({});

        expect(sexprs(natsChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
