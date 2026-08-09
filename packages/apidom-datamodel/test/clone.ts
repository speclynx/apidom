import { assert } from 'chai';

import { Metadata, StringElement, cloneDeep, cloneShallow } from '../src/index.ts';

describe('clone', function () {
  context('given Metadata', function () {
    describe('cloneDeep', function () {
      specify('should create a new Metadata instance', function () {
        const meta = new Metadata();
        meta.set('id', 'test');
        const clone = cloneDeep(meta);
        assert.notStrictEqual(clone, meta);
        assert.instanceOf(clone, Metadata);
      });

      specify('should deep clone Element values', function () {
        const el = new StringElement('hello');
        const meta = new Metadata();
        meta.set('custom', el);
        const clone = cloneDeep(meta);
        const clonedEl = clone.get('custom') as StringElement;
        assert.notStrictEqual(clonedEl, el);
        assert.strictEqual(clonedEl.toValue(), 'hello');
      });

      specify('should deep clone array values', function () {
        const classes = ['a', 'b'];
        const meta = new Metadata();
        meta.set('classes', classes);
        const clone = cloneDeep(meta);
        assert.deepEqual(clone.get('classes'), ['a', 'b']);
        assert.notStrictEqual(clone.get('classes'), classes);
      });
    });

    describe('cloneDeep.safe', function () {
      specify('should clone instead of returning the same reference', function () {
        const meta = new Metadata();
        meta.set('id', 'test');
        const clone = cloneDeep.safe(meta);
        assert.notStrictEqual(clone, meta);
        assert.instanceOf(clone, Metadata);
        assert.strictEqual(clone.get('id'), 'test');
      });
    });

    describe('cloneShallow', function () {
      specify('should create a new Metadata instance', function () {
        const meta = new Metadata();
        meta.set('id', 'test');
        const clone = cloneShallow(meta);
        assert.notStrictEqual(clone, meta);
        assert.instanceOf(clone, Metadata);
      });

      specify('should share references', function () {
        const el = new StringElement('hello');
        const classes = ['a', 'b'];
        const meta = new Metadata();
        meta.set('custom', el);
        meta.set('classes', classes);
        const clone = cloneShallow(meta);
        assert.strictEqual(clone.get('custom'), el);
        assert.strictEqual(clone.get('classes'), classes);
      });
    });

    describe('cloneShallow.safe', function () {
      specify('should clone instead of returning the same reference', function () {
        const meta = new Metadata();
        meta.set('id', 'test');
        const clone = cloneShallow.safe(meta);
        assert.notStrictEqual(clone, meta);
        assert.instanceOf(clone, Metadata);
        assert.strictEqual(clone.get('id'), 'test');
      });
    });
  });
});
