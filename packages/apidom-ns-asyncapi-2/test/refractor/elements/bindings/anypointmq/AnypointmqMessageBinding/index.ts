import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAnypointmqMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AnypointmqMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const anypointmqMessageBindingElement = refractAnypointmqMessageBinding({
          headers: {},
          bindingVersion: '0.1.0',
        });

        expect(sexprs(anypointmqMessageBindingElement)).toMatchSnapshot();
      });

      context('given headers field of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const anypointmqMessageBindingElement = refractAnypointmqMessageBinding({
            headers: {
              $ref: '#/pointer',
            },
            bindingVersion: '0.1.0',
          });

          expect(sexprs(anypointmqMessageBindingElement)).toMatchSnapshot();
        });
      });
    });
  });
});
