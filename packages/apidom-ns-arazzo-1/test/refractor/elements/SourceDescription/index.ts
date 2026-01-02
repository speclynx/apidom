import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractSourceDescription } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SourceDescriptionElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const sourceDescriptionElement = refractSourceDescription({
          name: 'petStoreDescription',
          url: 'https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml',
          type: 'openapi',
        });

        expect(sexprs(sourceDescriptionElement)).toMatchSnapshot();
      });
    });
  });
});
