import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractResponsesDefinitions } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ResponsesDefinitionsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const responsesDefinitionsElement = refractResponsesDefinitions({
          response1: {},
          response2: {},
        });

        expect(sexprs(responsesDefinitionsElement)).toMatchSnapshot();
      });
    });
  });
});
