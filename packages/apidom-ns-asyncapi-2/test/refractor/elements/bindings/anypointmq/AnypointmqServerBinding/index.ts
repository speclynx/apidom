import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAnypointmqServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AnypointmqServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const anypointmqServerBindingElement = refractAnypointmqServerBinding({});

        expect(sexprs(anypointmqServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
