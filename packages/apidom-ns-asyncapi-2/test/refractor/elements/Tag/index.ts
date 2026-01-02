import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractTag } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('TagElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const tagElement = refractTag({
          name: 'tag-name',
          description: 'tag-description',
          externalDocs: {},
        });

        expect(sexprs(tagElement)).toMatchSnapshot();
      });
    });
  });
});
