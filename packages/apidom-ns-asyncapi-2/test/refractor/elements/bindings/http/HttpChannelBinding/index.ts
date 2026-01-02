import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractHttpChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('HttpChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const httpChannelBindingElement = refractHttpChannelBinding({});

        expect(sexprs(httpChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
