import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { ExternalDocumentationElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ExternalDocumentationElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const externalDocumentationElement = ExternalDocumentationElement.refract({
          description: 'external-documentation-description',
          url: 'http://www.asyncapi.org/support',
        });

        expect(sexprs(externalDocumentationElement)).toMatchSnapshot();
      });
    });
  });
});
