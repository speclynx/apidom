import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractNatsMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('NatsMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const natsMessageBindingElement = refractNatsMessageBinding({});

        expect(sexprs(natsMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
