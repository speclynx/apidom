import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSnsMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SnsMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const snsMessageBindingElement = refractSnsMessageBinding({});

        expect(sexprs(snsMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
