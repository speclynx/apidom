import { assert } from 'chai';
import { Namespace, isMemberElement, isElement, ObjectElement } from '@speclynx/apidom-datamodel';

import { filter } from '../../src/index.ts';

const namespace = new Namespace();

describe('operations', function () {
  context('filter', function () {
    context('given ObjectElement', function () {
      // @ts-ignore
      const objElement: ObjectElement = new namespace.elements.Object({ a: 'b', c: 'd' });

      specify('should return Array instance', function () {
        const filtered = filter(objElement, (path) => isMemberElement(path.node));

        assert.isArray(filtered);
      });

      specify('should find content matching the predicate', function () {
        const filtered = filter(
          objElement,
          (path) =>
            isMemberElement(path.node) && isElement(path.node.key) && path.node.key.equals('a'),
        );

        assert.lengthOf(filtered, 1);
        assert.isTrue(isMemberElement(filtered[0].node));
        // @ts-ignore
        assert.isTrue(filtered[0].node.value.equals('b'));
      });
    });
  });
});
