import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSqsChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SqsChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const sqsChannelBindingElement = refractSqsChannelBinding({});

        expect(sexprs(sqsChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
