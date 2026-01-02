import { expect, assert } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import {
  refractExternalDocumentation,
  ExternalDocumentationElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ExternalDocumentationElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const externalDocumentationElement = refractExternalDocumentation({
          description: 'Find more info here',
          url: 'https://swagger.io',
        });

        expect(sexprs(externalDocumentationElement)).toMatchSnapshot();
      });

      specify('should support specification extensions', function () {
        const externalDocumentationElement = refractExternalDocumentation({
          description: 'Find more info here',
          'x-extension': 'extension',
        }) as ExternalDocumentationElement;

        assert.isFalse(
          includesClasses(externalDocumentationElement.getMember('description') as any, [
            'specification-extension',
          ]),
        );
        assert.isTrue(
          includesClasses(externalDocumentationElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });
    });
  });
});
