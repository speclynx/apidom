import { assert } from 'chai';
import { F as stubFalse } from 'ramda';
import { Namespace, isMemberElement, isElement, MemberElement } from '@speclynx/apidom-datamodel';

import { find } from '../../src/index.ts';

const namespace = new Namespace();

describe('operations', function () {
  context('find', function () {
    context('given ObjectElement', function () {
      // @ts-ignore
      const objElement = new namespace.elements.Object({ a: 'b', c: 'd' });

      specify('should return first match', function () {
        const predicate = (element: unknown): boolean =>
          isMemberElement(element) && isElement(element.key) && element.key.equals('c');
        // @ts-ignore
        const found = find(objElement, predicate) as MemberElement;

        assert.isTrue(isMemberElement(found));
        // @ts-ignore
        assert.isTrue(found.key.equals('c'));
        // @ts-ignore
        assert.isTrue(found.value.equals('d'));
      });

      context('given no match', function () {
        specify('should return undefined', function () {
          const found = find(objElement, stubFalse);

          assert.isUndefined(found);
        });
      });
    });
  });
});
