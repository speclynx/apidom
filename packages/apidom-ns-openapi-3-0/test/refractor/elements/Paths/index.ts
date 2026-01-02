import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractPaths } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('PathsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const pathsElement = refractPaths({
          '/path1': {},
          '/path2': {},
        });

        expect(sexprs(pathsElement)).toMatchSnapshot();
      });
    });
  });
});
