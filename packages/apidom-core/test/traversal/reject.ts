import { assert } from 'chai';
import {
  Namespace,
  isNumberElement,
  isStringElement,
  StringElement,
} from '@speclynx/apidom-datamodel';

import { reject } from '../../src/index.ts';

const namespace = new Namespace();

describe('traversal', function () {
  context('reject', function () {
    context('given ArrayElement', function () {
      // @ts-ignore
      const arrayElement = new namespace.elements.Array([1, 2, 3, 'a']);

      specify('should return Array instance', function () {
        const filtered = reject(isNumberElement, arrayElement);

        assert.isArray(filtered);
      });

      specify('should reject content matching the predicate', function () {
        const filtered = reject(isNumberElement, arrayElement);
        const stringElement = filtered[1] as StringElement;

        assert.lengthOf(filtered, 2);
        assert.strictEqual(filtered[0], arrayElement);
        assert.isTrue(isStringElement(stringElement));
        assert.isTrue(stringElement.equals('a'));
      });
    });
  });
});
