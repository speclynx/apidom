import { assert } from 'chai';

import { StringElement } from '../../src/index.ts';

describe('StringElement', function () {
  let stringElement: StringElement;

  before(function () {
    stringElement = new StringElement('foobar');
  });

  describe('#element', function () {
    specify('is a string', function () {
      assert.strictEqual(stringElement.element, 'string');
    });
  });

  describe('#primitive', function () {
    specify('returns string as the Refract primitive', function () {
      assert.strictEqual(stringElement.primitive(), 'string');
    });
  });

  describe('#get', function () {
    specify('returns the string value', function () {
      assert.strictEqual(stringElement.toValue(), 'foobar');
    });
  });

  describe('#set', function () {
    specify('sets the value of the string', function () {
      stringElement.set('hello world');
      assert.strictEqual(stringElement.toValue(), 'hello world');
    });
  });

  describe('#length', function () {
    specify('returns the length of the string', function () {
      assert.strictEqual(stringElement.length, 11);
    });
  });
});
