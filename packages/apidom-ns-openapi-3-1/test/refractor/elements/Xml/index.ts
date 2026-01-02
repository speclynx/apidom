import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractXml } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('XmlElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const xmlElement = refractXml({
          name: 'tag-name',
          namespace: 'https://example.com/schema/sample',
          prefix: 'sample',
          attribute: true,
          wrapped: false,
        });

        expect(sexprs(xmlElement)).toMatchSnapshot();
      });
    });
  });
});
