import { assert } from 'chai';
import { ObjectElement, StringElement, Element, MemberElement } from '../../src/index.ts';

describe('ObjectElement', function () {
  const thisArg = { message: 42 };

  let objectElement: ObjectElement;

  function setObject() {
    objectElement = new ObjectElement({
      foo: 'bar',
      z: 1,
    });
  }

  before(function () {
    setObject();
  });

  beforeEach(function () {
    setObject();
  });

  describe('.content', function () {
    specify('has the correct element names', function () {
      const correctElementNames = ['string', 'number'];
      const storedElementNames = (objectElement.content as Element[]).map(
        (el: Element) => (el as MemberElement).value!.element,
      );
      assert.deepEqual(storedElementNames, correctElementNames);
    });
  });

  describe('#element', function () {
    specify('is a string element', function () {
      assert.strictEqual(objectElement.element, 'object');
    });
  });

  describe('#primitive', function () {
    specify('returns object as the Refract primitive', function () {
      assert.strictEqual(objectElement.primitive(), 'object');
    });
  });

  describe('#toValue', function () {
    specify('returns the object', function () {
      assert.deepEqual(objectElement.toValue(), {
        foo: 'bar',
        z: 1,
      });
    });

    specify('returns undefined with member does not have a value', function () {
      const element = new ObjectElement();
      element.set('name', undefined);

      const value = element.toValue();
      assert.isUndefined(value.name);
    });
  });

  describe('#get', function () {
    context('when a property name is given', function () {
      specify('returns the value of the name given', function () {
        assert.strictEqual(objectElement.get('foo')!.toValue(), 'bar');
      });
    });

    context('when a property name is not given', function () {
      specify('is undefined', function () {
        assert.isUndefined(objectElement.get('' as unknown as string));
      });
    });
  });

  describe('#getValue', function () {
    context('when a property name is given', function () {
      specify('returns the value of the name given', function () {
        assert.strictEqual(objectElement.getValue('foo'), 'bar');
      });
    });

    context('when a property name is not given', function () {
      specify('is undefined', function () {
        assert.isUndefined(objectElement.getValue('' as unknown as string));
      });
    });
  });

  describe('#getMember', function () {
    context('when a property name is given', function () {
      specify('returns the correct member object', function () {
        assert.strictEqual(objectElement.getMember('foo')!.value!.toValue(), 'bar');
      });
    });

    context('when a property name is not given', function () {
      specify('is undefined', function () {
        assert.isUndefined(objectElement.getMember('' as unknown as string));
      });
    });
  });

  describe('#getKey', function () {
    context('when a property name is given', function () {
      specify('returns the correct key object', function () {
        assert.strictEqual(objectElement.getKey('foo')!.toValue(), 'foo');
      });
    });

    context('when a property name given that does not exist', function () {
      specify('returns undefined', function () {
        assert.isUndefined(objectElement.getKey('not-defined'));
      });
    });

    context('when a property name is not given', function () {
      specify('returns undefined', function () {
        assert.isUndefined(objectElement.getKey('' as unknown as string));
      });
    });
  });

  describe('#set', function () {
    specify('sets the value of the name given', function () {
      assert.strictEqual(objectElement.get('foo')!.toValue(), 'bar');
      objectElement.set('foo', 'hello world');
      assert.strictEqual(objectElement.get('foo')!.toValue(), 'hello world');
    });

    specify('sets a value that has not been defined yet', function () {
      objectElement.set('bar', 'hello world');
      assert.strictEqual(objectElement.get('bar')!.toValue(), 'hello world');
    });

    specify('accepts an object', function () {
      const obj = new ObjectElement();
      obj.set({ foo: 'bar' });
      assert.strictEqual(obj.get('foo')!.toValue(), 'bar');
    });

    specify('should refract key and value from object', function () {
      const obj = new ObjectElement();
      obj.set('key', 'value');
      const member = obj.getMember('key')!;

      assert.instanceOf(member.key, StringElement);
      assert.instanceOf(member.value, StringElement);
    });
  });

  describe('#keys', function () {
    specify('gets the keys of all properties', function () {
      assert.deepEqual(objectElement.keys(), ['foo', 'z']);
    });
  });

  describe('#remove', function () {
    specify('removes the given key', function () {
      const removed = objectElement.remove('z');

      assert.deepEqual(removed!.toValue(), { key: 'z', value: 1 });
      assert.deepEqual(objectElement.keys(), ['foo']);
    });
  });

  describe('#remove non-existing item', function () {
    specify('should not change the object element', function () {
      const removed = objectElement.remove('k');

      assert.deepEqual(removed, null);
      assert.deepEqual(objectElement.keys(), ['foo', 'z']);
    });
  });

  describe('#values', function () {
    specify('gets the values of all properties', function () {
      assert.deepEqual(objectElement.values(), ['bar', 1]);
    });
  });

  describe('#hasKey', function () {
    specify('checks to see if a key exists', function () {
      assert.isTrue(objectElement.hasKey('foo'));
      assert.isFalse(objectElement.hasKey('does-not-exist'));
    });
  });

  describe('#items', function () {
    specify('provides a list of name/value pairs to iterate', function () {
      const keys: unknown[] = [];
      const values: unknown[] = [];

      objectElement.items().forEach((item) => {
        const key = item[0];
        const value = item[1];

        keys.push(key);
        values.push(value);
      });

      assert.sameMembers(keys, ['foo', 'z']);
      assert.lengthOf(values, 2);
    });
  });

  function itHascollectionMethod(method: string) {
    describe(`#${method}`, function () {
      specify(`responds to #${method}`, function () {
        assert.isFunction((objectElement as unknown as Record<string, unknown>)[method]);
      });
    });
  }

  itHascollectionMethod('map');
  itHascollectionMethod('filter');
  itHascollectionMethod('forEach');
  itHascollectionMethod('push');

  describe('#map', function () {
    specify('provides the keys', function () {
      const keys = objectElement.map((value, key) => key.toValue());
      assert.deepEqual(keys, ['foo', 'z']);
    });

    specify('provides the values', function () {
      const values = objectElement.map((value) => value.toValue());
      assert.deepEqual(values, ['bar', 1]);
    });

    specify('provides the members', function () {
      const keys = objectElement.map((value, key, member) => member.key!.toValue());
      assert.deepEqual(keys, ['foo', 'z']);
    });

    specify('provides thisArg as this to callback', function () {
      const keys = objectElement.map(function map(this: typeof thisArg, value, key) {
        assert.deepEqual(this, thisArg);
        return key.toValue();
      }, thisArg);
      assert.deepEqual(keys, ['foo', 'z']);
    });
  });

  describe('#compactMap', function () {
    specify('provides the keys', function () {
      const keys = objectElement.compactMap((value, key) => {
        if (key.toValue() === 'foo') {
          return key.toValue();
        }

        return undefined;
      });
      assert.deepEqual(keys, ['foo']);
    });

    specify('provides the values', function () {
      const values = objectElement.compactMap((value, key) => {
        if (key.toValue() === 'foo') {
          return value.toValue();
        }

        return undefined;
      });
      assert.deepEqual(values, ['bar']);
    });

    specify('provides the members', function () {
      const keys = objectElement.compactMap((value, key, member) => {
        if (key.toValue() === 'foo') {
          return member.key!.toValue();
        }

        return undefined;
      });
      assert.deepEqual(keys, ['foo']);
    });

    specify('provides thisArg as this to callback', function () {
      const keys = objectElement.compactMap(function compactMap(this: typeof thisArg, value, key) {
        assert.deepEqual(this, thisArg);
        if (key.toValue() === 'foo') {
          return key.toValue();
        }

        return undefined;
      }, thisArg);
      assert.deepEqual(keys, ['foo']);
    });
  });

  describe('#filter', function () {
    specify('allows for filtering on keys', function () {
      const foo = objectElement.filter((value, key) => key.equals('foo'));
      assert.deepEqual(foo.keys(), ['foo']);
    });

    specify('allows for filtering on values', function () {
      const foo = objectElement.filter((value) => value.equals('bar'));
      assert.deepEqual(foo.keys(), ['foo']);
    });

    specify('allows for filtering on members', function () {
      const foo = objectElement.filter((value, key, member) => member.value!.equals('bar'));
      assert.deepEqual(foo.keys(), ['foo']);
    });

    specify('provides thisArg as this to callback', function () {
      const foo = objectElement.filter(function filter(this: typeof thisArg, value, key) {
        assert.deepEqual(this, thisArg);
        return key.equals('foo');
      }, thisArg);
      assert.deepEqual(foo.keys(), ['foo']);
    });
  });

  describe('#reject', function () {
    specify('allows for rejecting on keys', function () {
      const foo = objectElement.reject((value, key) => key.equals('foo'));
      assert.deepEqual(foo.keys(), ['z']);
    });

    specify('allows for rejecting on values', function () {
      const foo = objectElement.reject((value) => value.equals('bar'));
      assert.deepEqual(foo.keys(), ['z']);
    });

    specify('allows for rejecting on members', function () {
      const foo = objectElement.reject((value, key, member) => member.value!.equals('bar'));
      assert.deepEqual(foo.keys(), ['z']);
    });

    specify('provides thisArg as this to callback', function () {
      const foo = objectElement.reject(function filter(this: typeof thisArg, value, key) {
        assert.deepEqual(this, thisArg);
        return key.equals('foo');
      }, thisArg);
      assert.deepEqual(foo.keys(), ['z']);
    });
  });

  describe('#reduce', function () {
    const numbers = new ObjectElement({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    });

    specify('allows for reducing on keys', function () {
      const letters = numbers.reduce(
        (result: Element, item, key) =>
          (result as unknown as { push: (k: Element) => void }).push(key) as unknown as Element,
        [] as unknown as Element,
      );
      assert.deepEqual((letters as unknown as Element).toValue(), ['a', 'b', 'c', 'd']);
    });

    specify('sends member and object elements', function () {
      numbers.reduce((result, item, key, member, obj) => {
        assert.include(obj.content, member);
        assert.strictEqual(obj, numbers);
      });
    });

    context('when no beginning value is given', function () {
      specify('correctly reduces the object', function () {
        type ToValueType = { toValue: () => number };
        const total = numbers.reduce(
          (result, item) =>
            (result as unknown as ToValueType).toValue() +
            (item as unknown as ToValueType).toValue(),
        );
        assert.strictEqual((total as unknown as ToValueType).toValue(), 10);
      });
    });

    context('when a beginning value is given', function () {
      specify('correctly reduces the object', function () {
        type ToValueType = { toValue: () => number };
        const total = numbers.reduce(
          (result, item) =>
            (result as unknown as ToValueType).toValue() +
            (item as unknown as ToValueType).toValue(),
          20,
        );
        assert.strictEqual((total as unknown as ToValueType).toValue(), 30);
      });
    });
  });

  describe('#forEach', function () {
    specify('provides the keys', function () {
      const keys: unknown[] = [];
      objectElement.forEach((value, key) => keys.push(key.toValue()));
      assert.deepEqual(keys, ['foo', 'z']);
    });

    specify('provides the values', function () {
      const values: unknown[] = [];
      objectElement.forEach((value) => values.push(value.toValue()));
      assert.deepEqual(values, ['bar', 1]);
    });

    specify('provides the members', function () {
      const keys: unknown[] = [];
      objectElement.forEach((value, key, member) => keys.push(member.key!.toValue()));
      assert.deepEqual(keys, ['foo', 'z']);
    });

    specify('provides thisArg as this to callback', function () {
      const keys: unknown[] = [];

      objectElement.forEach(function forEach(this: typeof thisArg, value, key) {
        assert.deepEqual(this, thisArg);
        return keys.push(key.toValue());
      }, thisArg);

      assert.deepEqual(keys, ['foo', 'z']);
    });
  });

  describe('#find', function () {
    specify('allows for searching based on the keys', function () {
      const search = objectElement.find(
        (member: Element) => (member as MemberElement).key!.toValue() === 'z',
      );
      assert.lengthOf(search, 1);
      assert.strictEqual((search.get(0) as MemberElement).value!.toValue(), 1);
    });

    specify('allows for searching based on the member', function () {
      const search = objectElement.find(
        (member: Element) => (member as MemberElement).key!.toValue() === 'z',
      );
      assert.lengthOf(search, 1);
      assert.strictEqual((search.get(0) as MemberElement).value!.toValue(), 1);
    });
  });

  // describe('#[Symbol.iterator]', function() {
  //   specify('can be used in a for ... of loop', function() {
  //     var items = [];
  //     for (let item of objectElement) {
  //       items.push(item);
  //     }
  //
  //     assert.lengthOf(items, 2);
  //   });
  // });
});
