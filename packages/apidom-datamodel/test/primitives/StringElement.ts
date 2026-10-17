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

  // https://github.com/speclynx/apidom/issues/631
  describe('#toValue', function () {
    const emptyNode = (): StringElement => {
      const element = new StringElement('');
      element.classes.push('yaml-e-node');
      return element;
    };

    it('should return null for an empty YAML node', function () {
      assert.isNull(emptyNode().toValue());
    });

    it('should return the content of an empty YAML node once changed', function () {
      const element = emptyNode();
      element.content = 'x';

      assert.strictEqual(element.toValue(), 'x');
    });

    it('should return empty string without the class and not add classes', function () {
      const element = new StringElement('');

      assert.strictEqual(element.toValue(), '');
      assert.isFalse(element.hasMetaProperty('classes'));
    });

    it('should not equal an empty string', function () {
      assert.isFalse(emptyNode().equals(new StringElement('')));
      assert.isTrue(emptyNode().equals(null));
    });
  });

  describe('#length', function () {
    specify('returns the length of the string', function () {
      assert.strictEqual(stringElement.length, 11);
    });
  });
});
