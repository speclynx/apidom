import { assert } from 'chai';

import { BooleanElement } from '../../src/index.ts';

describe('BooleanElement', function () {
  let booleanElement: BooleanElement;

  beforeEach(function () {
    booleanElement = new BooleanElement(true);
  });

  describe('#element', function () {
    specify('is a boolean', function () {
      assert.strictEqual(booleanElement.element, 'boolean');
    });
  });

  describe('#primitive', function () {
    specify('returns boolean as the Refract primitive', function () {
      assert.strictEqual(booleanElement.primitive(), 'boolean');
    });
  });

  describe('#get', function () {
    specify('returns the boolean value', function () {
      assert.strictEqual(booleanElement.toValue(), true);
    });
  });

  describe('#set', function () {
    specify('sets the value of the boolean', function () {
      booleanElement.set(false);
      assert.strictEqual(booleanElement.toValue(), false);
    });
  });
});
