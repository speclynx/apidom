import { assert, expect } from 'chai';
import { includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractPaths, PathsElement } from '../../../../src/index.ts';

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

      specify('should support specification extensions', function () {
        const pathsElement = refractPaths({
          '/path1': {},
          'x-extension': 'extension',
        }) as PathsElement;

        assert.isFalse(
          includesClasses(pathsElement.getMember('/path1') as any, ['specification-extension']),
        );
        assert.isTrue(
          includesClasses(pathsElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });
    });
  });
});
