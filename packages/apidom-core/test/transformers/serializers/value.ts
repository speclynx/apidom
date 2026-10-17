import { assert } from 'chai';
import {
  BooleanElement,
  NumberElement,
  StringElement,
  NullElement,
  ObjectElement,
  ArrayElement,
  RefElement,
  LinkElement,
  MemberElement,
} from '@speclynx/apidom-datamodel';

import serializer from '../../../src/transformers/serializers/value.ts';

describe('serializers', function () {
  context('value', function () {
    context('given BooleanElement', function () {
      specify('should serialize to JavaScript value', function () {
        const trueBooleanElement = new BooleanElement(true);
        const falseBooleanElement = new BooleanElement(false);

        assert.strictEqual(serializer(trueBooleanElement), true);
        assert.strictEqual(serializer(falseBooleanElement), false);
      });
    });

    context('given NumberElement', function () {
      specify('should serialize to JavaScript value', function () {
        const numberElement = new NumberElement(1);

        assert.strictEqual(serializer(numberElement), 1);
      });
    });

    context('given StringElement', function () {
      specify('should serialize to JavaScript value', function () {
        const stringElement = new StringElement('string');

        assert.strictEqual(serializer(stringElement), 'string');
      });
    });

    context('given NullElement', function () {
      specify('should serialize to JavaScript value', function () {
        const nullElement = new NullElement();

        assert.isNull(serializer(nullElement));
      });
    });

    context('given ObjectElement', function () {
      specify('should serialize to JavaScript value', function () {
        const objectElement = new ObjectElement({ a: { b: { c: 'd', e: true } } });

        assert.deepEqual(serializer(objectElement), { a: { b: { c: 'd', e: true } } });
      });

      context('and with cycle', function () {
        specify('should serialize to JavaScript value with cycle', function () {
          const cycle = new ObjectElement({ a: 'b' });
          cycle.set('c', cycle);
          const expected: { a: string; c?: any } = { a: 'b' };
          expected.c = expected;

          assert.deepEqual(serializer(cycle), expected);
        });
      });

      context('and duplicates with no cycle', function () {
        specify('should serialize to JavaScript value', function () {
          const object = { prop: 'val' };
          const duplicates = new ObjectElement({ a: object, b: object });

          assert.deepEqual(serializer(duplicates), { a: object, b: object });
        });
      });
    });

    context('given ArrayElement', function () {
      specify('should serialize to JavaScript value', function () {
        const arrayElement = new ArrayElement([1, 'test', null, true, [1], { a: 'b' }]);

        assert.deepEqual(serializer(arrayElement), [1, 'test', null, true, [1], { a: 'b' }]);
      });

      context('and with cycle', function () {
        specify('should serialize to JavaScript value with cycle', function () {
          const cycle = new ArrayElement([1, '2']);
          cycle.set(2, cycle);
          const expected: any[] = [1, '2'];
          expected[2] = expected;

          assert.deepEqual(serializer(cycle), expected);
        });
      });

      context('and duplicates with no cycle', function () {
        specify('should serialize to JavaScript value', function () {
          const array = [1, '2'];
          const duplicates = new ArrayElement([array, array]);
          const expected = [array, array];

          assert.deepEqual(serializer(duplicates), expected);
        });
      });
    });

    context('given duplicate ArrayElement inside ObjectElement', function () {
      specify('should serialize to JavaScript value', function () {
        const array = new ArrayElement(['a', 'b', 'c']);
        const object = new ObjectElement({ d: array, e: array });
        const serialized = serializer(object) as { d: unknown[]; e: unknown[] };

        assert.deepEqual(serialized, { d: ['a', 'b', 'c'], e: ['a', 'b', 'c'] });
        assert.strictEqual(serialized.d, serialized.e);
      });
    });

    context('given duplicate ObjectElement inside ArrayElement', function () {
      specify('should serialize to JavaScript value', function () {
        const object = new ObjectElement({ a: 'b' });
        const array = new ArrayElement([object, object]);
        const serialized = serializer(array) as unknown[];

        assert.deepEqual(serialized, [{ a: 'b' }, { a: 'b' }]);
        assert.strictEqual(serialized[0], serialized[1]);
      });
    });

    context('given ObjectElement with undefined value', function () {
      specify('should serialize to JavaScript value', function () {
        const object = new ObjectElement({ a: undefined });
        const serialized = serializer(object);

        assert.deepEqual(serialized, { a: undefined });
      });
    });

    // https://github.com/speclynx/apidom/issues/650
    context('given ObjectElement with non-string keys', function () {
      specify('should use string form of scalar keys', function () {
        const object = new ObjectElement();
        object.push(new MemberElement(new NumberElement(200), new StringElement('ok')));
        object.push(new MemberElement(new NumberElement(1.5), new StringElement('a')));
        object.push(new MemberElement(new BooleanElement(true), new StringElement('b')));
        object.push(new MemberElement(new NullElement(), new StringElement('c')));

        assert.deepEqual(serializer(object), { '200': 'ok', '1.5': 'a', true: 'b', null: 'c' });
      });

      specify('should name collection keys by their JSON text', function () {
        const object = new ObjectElement({ a: 1 });
        object.push(new MemberElement(new ArrayElement(['x']), new StringElement('d')));
        object.push(new MemberElement(new ObjectElement({ b: 1 }), new StringElement('e')));

        assert.deepEqual(serializer(object), { a: 1, '["x"]': 'd', '{"b":1}': 'e' });
      });

      specify('should skip cyclic collection keys', function () {
        const key = new ObjectElement({ b: 1 });
        key.set('self', key);
        const object = new ObjectElement({ a: 1 });
        object.push(new MemberElement(key, new StringElement('d')));

        assert.deepEqual(serializer(object), { a: 1 });
      });
    });

    context('given RefElement', function () {
      specify('should serialize to JavaScript value', function () {
        const ref = new RefElement('id');
        const serialized = serializer(ref);

        assert.strictEqual(serialized, 'id');
      });

      context('and nested inside ObjectElement', function () {
        specify('should serialize to JavaScript value', function () {
          const object = new ObjectElement({
            ref: new RefElement('id'),
          });
          const serialized = serializer(object);

          assert.deepEqual(serialized, { ref: 'id' });
        });
      });

      context('and included instead of MemberElement', function () {
        specify('should remove from serialization', function () {
          const object = new ObjectElement({
            a: 'b',
          });
          (object.content as unknown[]).push(new RefElement('id'));
          const serialized = serializer(object);

          assert.deepEqual(serialized, { a: 'b' });
        });
      });
    });

    context('given LinkElement', function () {
      specify('should serialize to JavaScript value', function () {
        const ref = new LinkElement();
        const serialized = serializer(ref);

        assert.strictEqual(serialized, '');
      });

      context('and nested inside ObjectElement', function () {
        specify('should serialize to JavaScript value', function () {
          const object = new ObjectElement({
            link: new LinkElement(undefined, undefined, { relation: 'foo', href: '/bar' }),
          });
          const serialized = serializer(object);

          assert.deepEqual(serialized, { link: '/bar' });
        });
      });
    });

    context('given a "__proto__" key', function () {
      specify('should keep it as an own property instead of setting the prototype', function () {
        const element = new ObjectElement();
        element.set('__proto__', new ObjectElement({ injected: 'yes' }));
        element.set('safe', 1);

        const value = serializer(element) as Record<string, unknown>;

        assert.isTrue(Object.hasOwn(value, '__proto__'));
        // read through the descriptor: `value.__proto__` would also return the
        // injected object in the broken case, so it proves nothing on its own
        assert.deepEqual(Object.getOwnPropertyDescriptor(value, '__proto__')!.value, {
          injected: 'yes',
        });
        assert.strictEqual(value.safe, 1);
        assert.strictEqual(Object.getPrototypeOf(value), Object.prototype);
        assert.isUndefined(value.injected);
      });
    });

    context('given primitive value', function () {
      specify('should acts as identify function', function () {
        assert.strictEqual(serializer(1 as any), 1);
        assert.strictEqual(serializer('string' as any), 'string');
        assert.isNull(serializer(null as any));
        assert.isUndefined(serializer(undefined as any));
      });
    });
  });
});
