import { assert } from 'chai';
import { F as stubFalse } from 'ramda';
import { Namespace, isMemberElement, isElement } from '@speclynx/apidom-datamodel';

import { find } from '../../src/index.ts';

const namespace = new Namespace();

describe('operations', function () {
  context('find', function () {
    context('given ObjectElement', function () {
      // @ts-ignore
      const objElement = new namespace.elements.Object({ a: 'b', c: 'd' });

      specify('should return first matching path', function () {
        const found = find(
          objElement,
          (path) =>
            isMemberElement(path.node) && isElement(path.node.key) && path.node.key.equals('c'),
        );

        assert.isDefined(found);
        assert.isTrue(isMemberElement(found!.node));
        // @ts-ignore
        assert.isTrue(found!.node.key.equals('c'));
        // @ts-ignore
        assert.isTrue(found!.node.value.equals('d'));
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
