import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractNatsOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('NatsOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const natsOperationBindingElement = refractNatsOperationBinding({
          queue: 'test',
          bindingVersion: '0.1.0',
        });

        expect(sexprs(natsOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
