import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSnsChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SnsChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const snsChannelBindingElement = refractSnsChannelBinding({});

        expect(sexprs(snsChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
