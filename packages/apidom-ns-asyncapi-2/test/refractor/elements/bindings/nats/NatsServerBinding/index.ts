import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractNatsServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('NatsServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const natsServerBindingElement = refractNatsServerBinding({});

        expect(sexprs(natsServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
