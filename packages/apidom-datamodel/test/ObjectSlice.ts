import { assert } from 'chai';
import { MemberElement, ObjectSlice } from '../src/index.ts';

describe('ObjectSlice', function () {
  const thisArg = { message: 42 };

  specify('provides map', function () {
    const slice = new ObjectSlice([new MemberElement('name', 'Doe')]);

    const result = slice.map(function map(this: typeof thisArg, value) {
      assert.deepEqual(this, thisArg);
      return value.toValue();
    }, thisArg);

    assert.deepEqual(result, ['Doe']);
  });

  specify('provides forEach', function () {
    const element = new MemberElement('name', 'Doe');
    const slice = new ObjectSlice([element]);

    const keys: unknown[] = [];
    const values: unknown[] = [];
    const members: MemberElement[] = [];
    const indexes: number[] = [];

    slice.forEach(function forEach(this: typeof thisArg, value, key, member, index) {
      keys.push(key.toValue());
      values.push(value.toValue());
      members.push(member);
      indexes.push(index);

      assert.deepEqual(this, thisArg);
    }, thisArg);

    assert.deepEqual(keys, ['name']);
    assert.deepEqual(values, ['Doe']);
    assert.deepEqual(members, [element]);
    assert.deepEqual(indexes, [0]);
  });

  specify('provides filter', function () {
    const slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
      new MemberElement('name', 'Bill'),
    ]);

    const filtered = slice.filter(function filter(this: typeof thisArg, value) {
      assert.deepEqual(this, thisArg);
      return value.toValue() === 'Doe';
    }, thisArg);

    assert.instanceOf(filtered, ObjectSlice);
    assert.deepEqual(filtered.toValue(), [{ key: 'name', value: 'Doe' }]);
  });

  specify('provides reject', function () {
    const slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
      new MemberElement('name', 'Bill'),
    ]);

    const filtered = slice.reject(function filter(this: typeof thisArg, value) {
      assert.deepEqual(this, thisArg);
      return value.toValue() === 'Doe';
    }, thisArg);

    assert.instanceOf(filtered, ObjectSlice);
    assert.deepEqual(filtered.toValue(), [{ key: 'name', value: 'Bill' }]);
  });

  specify('provides keys', function () {
    const element = new MemberElement('name', 'Doe');
    const slice = new ObjectSlice([element]);

    assert.deepEqual(slice.keys(), ['name']);
  });

  specify('provides values', function () {
    const element = new MemberElement('name', 'Doe');
    const slice = new ObjectSlice([element]);

    assert.deepEqual(slice.values(), ['Doe']);
  });
});
