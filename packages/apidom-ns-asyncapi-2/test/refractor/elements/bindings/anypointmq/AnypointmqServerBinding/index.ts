import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { AnypointmqServerBindingElement } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AnypointmqServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const anypointmqServerBindingElement = AnypointmqServerBindingElement.refract({});

        expect(sexprs(anypointmqServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
