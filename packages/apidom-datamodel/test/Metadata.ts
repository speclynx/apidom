import { assert } from 'chai';

import { Metadata, StringElement } from '../src/index.ts';

describe('Metadata', function () {
  describe('#get / #set', function () {
    specify('should store and retrieve a primitive value', function () {
      const meta = new Metadata();
      meta.set('title', 'hello');
      assert.strictEqual(meta.get('title'), 'hello');
    });

    specify('should store and retrieve an Element value', function () {
      const meta = new Metadata();
      const el = new StringElement('world');
      meta.set('custom', el);
      assert.strictEqual(meta.get('custom'), el);
    });

    specify('should return undefined for missing keys', function () {
      const meta = new Metadata();
      assert.isUndefined(meta.get('missing'));
    });
  });

  describe('#hasKey', function () {
    specify('should return true for own properties', function () {
      const meta = new Metadata();
      meta.set('id', 'test');
      assert.isTrue(meta.hasKey('id'));
    });

    specify('should return false for missing keys', function () {
      const meta = new Metadata();
      assert.isFalse(meta.hasKey('id'));
    });

    specify('should not detect prototype methods as keys', function () {
      const meta = new Metadata();
      assert.isFalse(meta.hasKey('get'));
      assert.isFalse(meta.hasKey('set'));
      assert.isFalse(meta.hasKey('freeze'));
    });
  });

  describe('#keys', function () {
    specify('should return only own property keys', function () {
      const meta = new Metadata();
      meta.set('id', 'test');
      meta.set('classes', ['a']);
      assert.deepEqual(meta.keys(), ['id', 'classes']);
    });

    specify('should not include prototype methods', function () {
      const meta = new Metadata();
      meta.set('id', 'test');
      const keys = meta.keys();
      assert.notInclude(keys, 'get');
      assert.notInclude(keys, 'set');
      assert.notInclude(keys, 'freeze');
    });
  });

  describe('#remove', function () {
    specify('should remove an own property', function () {
      const meta = new Metadata();
      meta.set('id', 'test');
      meta.remove('id');
      assert.isFalse(meta.hasKey('id'));
    });
  });

  describe('#isEmpty', function () {
    specify('should return true when no data properties', function () {
      const meta = new Metadata();
      assert.isTrue(meta.isEmpty);
    });

    specify('should return false when data properties exist', function () {
      const meta = new Metadata();
      meta.set('id', 'test');
      assert.isFalse(meta.isEmpty);
    });
  });

  describe('#freeze', function () {
    specify('should freeze the metadata container', function () {
      const meta = new Metadata();
      meta.set('id', 'test');
      meta.freeze();
      assert.isTrue(meta.isFrozen);
    });

    specify('should freeze Element values', function () {
      const meta = new Metadata();
      const el = new StringElement('hello');
      meta.set('custom', el);
      meta.freeze();
      assert.isTrue(el.isFrozen);
    });

    specify('should freeze array values', function () {
      const classes = ['a', 'b'];
      const meta = new Metadata();
      meta.set('classes', classes);
      meta.freeze();
      assert.isTrue(Object.isFrozen(classes));
    });

    specify('should freeze plain object values', function () {
      const obj = { key: 'value' };
      const meta = new Metadata();
      meta.set('custom', obj);
      meta.freeze();
      assert.isTrue(Object.isFrozen(obj));
    });

    specify('should prevent adding new properties after freeze', function () {
      const meta = new Metadata();
      meta.freeze();
      assert.throws(() => meta.set('id', 'test'), TypeError);
    });
  });

  describe('#isFrozen', function () {
    specify('should return false before freezing', function () {
      const meta = new Metadata();
      assert.isFalse(meta.isFrozen);
    });

    specify('should return true after freezing', function () {
      const meta = new Metadata();
      meta.freeze();
      assert.isTrue(meta.isFrozen);
    });
  });

  describe('#cloneShallow', function () {
    specify('should create a new Metadata instance', function () {
      const meta = new Metadata();
      meta.set('id', 'test');
      const clone = meta.cloneShallow();
      assert.notStrictEqual(clone, meta);
      assert.instanceOf(clone, Metadata);
    });

    specify('should copy all own properties', function () {
      const meta = new Metadata();
      meta.set('id', 'test');
      meta.set('classes', ['a']);
      const clone = meta.cloneShallow();
      assert.strictEqual(clone.get('id'), 'test');
      assert.deepEqual(clone.get('classes'), ['a']);
    });

    specify('should share references (shallow)', function () {
      const classes = ['a', 'b'];
      const meta = new Metadata();
      meta.set('classes', classes);
      const clone = meta.cloneShallow();
      assert.strictEqual(clone.get('classes'), classes);
    });

    specify('should share Element references', function () {
      const el = new StringElement('hello');
      const meta = new Metadata();
      meta.set('custom', el);
      const clone = meta.cloneShallow();
      assert.strictEqual(clone.get('custom'), el);
    });
  });

  describe('#cloneDeep', function () {
    specify('should create a new Metadata instance', function () {
      const meta = new Metadata();
      meta.set('id', 'test');
      const clone = meta.cloneDeep();
      assert.notStrictEqual(clone, meta);
      assert.instanceOf(clone, Metadata);
    });

    specify('should deep clone arrays', function () {
      const classes = ['a', 'b'];
      const meta = new Metadata();
      meta.set('classes', classes);
      const clone = meta.cloneDeep();
      assert.deepEqual(clone.get('classes'), ['a', 'b']);
      assert.notStrictEqual(clone.get('classes'), classes);
    });

    specify('should deep clone Element values', function () {
      const el = new StringElement('hello');
      const meta = new Metadata();
      meta.set('custom', el);
      const clone = meta.cloneDeep();
      const clonedEl = clone.get('custom') as StringElement;
      assert.notStrictEqual(clonedEl, el);
      assert.strictEqual(clonedEl.toValue(), 'hello');
    });

    specify('should copy primitive values', function () {
      const meta = new Metadata();
      meta.set('id', 'test');
      meta.set('count', 42);
      const clone = meta.cloneDeep();
      assert.strictEqual(clone.get('id'), 'test');
      assert.strictEqual(clone.get('count'), 42);
    });
  });

  describe('#merge', function () {
    specify('should return a new Metadata instance', function () {
      const target = new Metadata();
      const source = new Metadata();
      const result = target.merge(source);
      assert.notStrictEqual(result, target);
      assert.notStrictEqual(result, source);
      assert.instanceOf(result, Metadata);
    });

    specify('should keep target-only keys', function () {
      const target = new Metadata();
      target.set('id', 'target-id');
      const source = new Metadata();
      const result = target.merge(source);
      assert.strictEqual(result.get('id'), 'target-id');
    });

    specify('should copy source-only keys', function () {
      const target = new Metadata();
      const source = new Metadata();
      source.set('title', 'source-title');
      const result = target.merge(source);
      assert.strictEqual(result.get('title'), 'source-title');
    });

    specify('should overwrite scalar values with source', function () {
      const target = new Metadata();
      target.set('id', 'target-id');
      const source = new Metadata();
      source.set('id', 'source-id');
      const result = target.merge(source);
      assert.strictEqual(result.get('id'), 'source-id');
    });

    specify('should concatenate arrays', function () {
      const target = new Metadata();
      target.set('classes', ['a', 'b']);
      const source = new Metadata();
      source.set('classes', ['c']);
      const result = target.merge(source);
      assert.deepEqual(result.get('classes'), ['a', 'b', 'c']);
    });

    specify('should overwrite when only one side is array', function () {
      const target = new Metadata();
      target.set('field', 'string-value');
      const source = new Metadata();
      source.set('field', ['array-value']);
      const result = target.merge(source);
      assert.deepEqual(result.get('field'), ['array-value']);
    });

    specify('should not mutate target', function () {
      const target = new Metadata();
      target.set('classes', ['a']);
      const source = new Metadata();
      source.set('classes', ['b']);
      target.merge(source);
      assert.deepEqual(target.get('classes'), ['a']);
    });

    specify('should not mutate source', function () {
      const target = new Metadata();
      target.set('classes', ['a']);
      const source = new Metadata();
      source.set('classes', ['b']);
      target.merge(source);
      assert.deepEqual(source.get('classes'), ['b']);
    });
  });
});
