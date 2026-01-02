import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractTags } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('TagsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const tagsElement = refractTags([{}, {}]);

        expect(sexprs(tagsElement)).toMatchSnapshot();
      });
    });
  });
});
