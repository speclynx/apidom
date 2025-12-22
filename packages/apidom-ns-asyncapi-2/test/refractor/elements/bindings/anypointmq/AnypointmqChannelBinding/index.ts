import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { AnypointmqChannelBindingElement } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AnypointmqChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const anypointmqChannelBindingElement = AnypointmqChannelBindingElement.refract({
          destination: 'channel-name',
          destinationType: 'queue',
          bindingVersion: 'latest',
        });

        expect(sexprs(anypointmqChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
