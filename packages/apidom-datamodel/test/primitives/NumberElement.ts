import { assert } from 'chai';

import { NumberElement } from '../../src/index.ts';

describe('NumberElement', function () {
  let numberElement: NumberElement;

  before(function () {
    numberElement = new NumberElement(4);
  });

  describe('#element', function () {
    specify('is a number', function () {
      assert.strictEqual(numberElement.element, 'number');
    });
  });

  describe('#primitive', function () {
    specify('returns number as the Refract primitive', function () {
      assert.strictEqual(numberElement.primitive(), 'number');
    });
  });

  describe('#get', function () {
    specify('returns the number value', function () {
      assert.strictEqual(numberElement.toValue(), 4);
    });
  });

  describe('#set', function () {
    specify('sets the value of the number', function () {
      numberElement.set(10);
      assert.strictEqual(numberElement.toValue(), 10);
    });
  });
});
