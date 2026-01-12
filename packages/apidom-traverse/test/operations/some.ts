import { assert } from 'chai';
import { F as stubFalse } from 'ramda';
import { Namespace, isMemberElement } from '@speclynx/apidom-datamodel';

import { some } from '../../src/index.ts';

const namespace = new Namespace();

describe('operations', function () {
  context('some', function () {
    context('given ObjectElement', function () {
      // @ts-ignore
      const objElement = new namespace.elements.Object({ a: 'b', c: 'd' });

      context('given match', function () {
        specify('should return true', function () {
          const isFound = some(objElement, isMemberElement);

          assert.isTrue(isFound);
        });
      });

      context('given no match', function () {
        specify('should return false', function () {
          const isFound = some(objElement, stubFalse);

          assert.isFalse(isFound);
        });
      });
    });
  });
});
