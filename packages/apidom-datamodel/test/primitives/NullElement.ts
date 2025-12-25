import { assert } from 'chai';

import { NullElement } from '../../src/index.ts';

describe('NullElement', function () {
  let nullElement: NullElement;

  before(function () {
    nullElement = new NullElement();
  });

  describe('#element', function () {
    specify('is null', function () {
      assert.strictEqual(nullElement.element, 'null');
    });
  });

  describe('#primitive', function () {
    specify('returns null as the Refract primitive', function () {
      assert.strictEqual(nullElement.primitive(), 'null');
    });
  });

  describe('#get', function () {
    specify('returns the null value', function () {
      assert.strictEqual(nullElement.toValue(), null);
    });
  });

  describe('#set', function () {
    specify('cannot set the value', function () {
      assert.throws(() => nullElement.set('foobar'), 'Cannot set the value of null');
    });
  });
});
