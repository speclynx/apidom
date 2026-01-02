import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAnypointmqChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AnypointmqChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const anypointmqChannelBindingElement = refractAnypointmqChannelBinding({
          destination: 'channel-name',
          destinationType: 'queue',
          bindingVersion: 'latest',
        });

        expect(sexprs(anypointmqChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
