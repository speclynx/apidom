import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractGooglepubsubOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('GooglepubsubOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const googlepubsubOperationBindingElement = refractGooglepubsubOperationBinding({});

        expect(sexprs(googlepubsubOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
