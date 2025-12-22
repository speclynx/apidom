import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { AnypointmqOperationBindingElement } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AnypointmqOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const anypointmqOperationBindingElement = AnypointmqOperationBindingElement.refract({});

        expect(sexprs(anypointmqOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
