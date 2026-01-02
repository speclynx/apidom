import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAnypointmqOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AnypointmqOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const anypointmqOperationBindingElement = refractAnypointmqOperationBinding({});

        expect(sexprs(anypointmqOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
