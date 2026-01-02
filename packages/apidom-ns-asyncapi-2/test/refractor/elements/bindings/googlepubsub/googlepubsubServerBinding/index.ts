import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractGooglepubsubServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('GooglepubsubServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const googlepubsubServerBindingElement = refractGooglepubsubServerBinding({});

        expect(sexprs(googlepubsubServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
