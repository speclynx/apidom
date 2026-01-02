import { expect, assert } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractXml, XmlElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('XmlElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const xmlElement = refractXml({
          name: 'animal',
          namespace: 'http://swagger.io/schema/sample',
          prefix: 'sample',
          attribute: true,
          wrapped: false,
        });

        expect(sexprs(xmlElement)).toMatchSnapshot();
      });

      specify('should support specification extensions', function () {
        const xmlElement = refractXml({
          name: 'animal',
          'x-extension': 'extension',
        }) as XmlElement;

        assert.isFalse(
          includesClasses(xmlElement.getMember('name') as any, ['specification-extension']),
        );
        assert.isTrue(
          includesClasses(xmlElement.getMember('x-extension') as any, ['specification-extension']),
        );
      });
    });
  });
});
