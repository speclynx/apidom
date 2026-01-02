import { assert } from 'chai';
import { Namespace, isMemberElement, isElement, ObjectElement } from '@speclynx/apidom-datamodel';

import { filter } from '../../src/index.ts';

const namespace = new Namespace();

describe('traversal', function () {
  context('filter', function () {
    context('given ObjectElement', function () {
      // @ts-ignore
      const objElement: ObjectElement = new namespace.elements.Object({ a: 'b', c: 'd' });

      specify('should return Array instance', function () {
        const filtered = filter(isMemberElement, objElement);

        assert.isArray(filtered);
      });

      specify('should find content matching the predicate', function () {
        const predicate = (element: unknown): boolean =>
          isMemberElement(element) && isElement(element.key) && element.key.equals('a');
        const filtered = filter(predicate, objElement);

        assert.lengthOf(filtered, 1);
        assert.isTrue(isMemberElement(filtered[0]));
        // @ts-ignore
        assert.isTrue(filtered[0].value.equals('b'));
      });
    });
  });
});
