import { assert } from 'chai';
import {
  Namespace,
  isNumberElement,
  isStringElement,
  StringElement,
} from '@speclynx/apidom-datamodel';

import { reject } from '../../src/index.ts';

const namespace = new Namespace();

describe('operations', function () {
  context('reject', function () {
    context('given ArrayElement', function () {
      // @ts-ignore
      const arrayElement = new namespace.elements.Array([1, 2, 3, 'a']);

      specify('should return Array instance', function () {
        const filtered = reject(arrayElement, (path) => isNumberElement(path.node));

        assert.isArray(filtered);
      });

      specify('should reject content matching the predicate', function () {
        const filtered = reject(arrayElement, (path) => isNumberElement(path.node));
        const stringElement = filtered[1].node as StringElement;

        assert.lengthOf(filtered, 2);
        assert.strictEqual(filtered[0].node, arrayElement);
        assert.isTrue(isStringElement(stringElement));
        assert.isTrue(stringElement.equals('a'));
      });
    });
  });
});
