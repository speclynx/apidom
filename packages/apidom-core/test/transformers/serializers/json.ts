import { assert } from 'chai';
import {
  ObjectElement,
  ArrayElement,
  StringElement,
  NumberElement,
  BooleanElement,
  NullElement,
} from '@speclynx/apidom-datamodel';

import serialize from '../../../src/transformers/serializers/json.ts';

describe('serializers', function () {
  context('json', function () {
    context('given positional signature', function () {
      specify('should serialize with replacer and space', function () {
        const element = new ObjectElement({ a: 'b' });
        const result = serialize(element, undefined, 2);

        assert.strictEqual(result, '{\n  "a": "b"\n}');
      });
    });

    context('preserveStyle', function () {
      context('given ObjectElement with indent style', function () {
        specify('should preserve indentation', function () {
          const element = new ObjectElement({ a: 1, b: 'hello' });
          element.style = { json: { indent: 4 } };

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '{\n    "a": 1,\n    "b": "hello"\n}');
        });
      });

      context('given NumberElement with rawContent', function () {
        specify('should preserve raw number representation', function () {
          const element = new ObjectElement({});
          const numElement = new NumberElement(15000000000);
          numElement.style = { json: { indent: 2, rawContent: '1.5e10' } };
          element.set('value', numElement);
          element.style = { json: { indent: 2 } };

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '{\n  "value": 1.5e10\n}');
        });
      });

      context('given nested structure', function () {
        specify('should preserve indentation through nesting', function () {
          const inner = new ObjectElement({ c: true });
          inner.style = { json: { indent: 2 } };

          const outer = new ObjectElement({});
          outer.set('a', 1);
          outer.set('b', inner);
          outer.style = { json: { indent: 2 } };

          const result = serialize(outer, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '{\n  "a": 1,\n  "b": {\n    "c": true\n  }\n}');
        });
      });

      context('given ArrayElement', function () {
        specify('should serialize with indentation', function () {
          const element = new ArrayElement([1, 'two', true, null]);
          element.style = { json: { indent: 2 } };

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '[\n  1,\n  "two",\n  true,\n  null\n]');
        });
      });

      context('given empty ObjectElement', function () {
        specify('should serialize to empty object', function () {
          const element = new ObjectElement({});
          element.style = { json: { indent: 2 } };

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '{}');
        });
      });

      context('given empty ArrayElement', function () {
        specify('should serialize to empty array', function () {
          const element = new ArrayElement([]);
          element.style = { json: { indent: 2 } };

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '[]');
        });
      });

      context('given no style on element', function () {
        specify('should serialize without indentation', function () {
          const element = new ObjectElement({ a: 'b' });

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '{"a":"b"}');
        });
      });

      context('given space argument overrides element style indent', function () {
        specify('should use space argument', function () {
          const element = new ObjectElement({ a: 'b' });
          element.style = { json: { indent: 4 } };

          const result = serialize(element, undefined, 2, { preserveStyle: true });

          assert.strictEqual(result, '{\n  "a": "b"\n}');
        });
      });

      context('given scalar elements', function () {
        specify('should serialize StringElement', function () {
          const element = new StringElement('hello');

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '"hello"');
        });

        specify('should serialize BooleanElement', function () {
          const element = new BooleanElement(true);

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, 'true');
        });

        specify('should serialize NullElement', function () {
          const element = new NullElement();

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, 'null');
        });

        specify('should serialize NumberElement without rawContent', function () {
          const element = new NumberElement(42);

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '42');
        });

        specify('should expand every occurrence of a shared element instance', function () {
          const shared = new ObjectElement({ title: 'shared title' });
          const element = new ObjectElement({ a: new ObjectElement(), b: new ObjectElement() });
          (element.get('a') as ObjectElement).set('schema', shared);
          (element.get('b') as ObjectElement).set('schema', shared);

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(
            result,
            '{"a":{"schema":{"title":"shared title"}},"b":{"schema":{"title":"shared title"}}}',
          );
        });

        specify('should expand a shared element instance within an ArrayElement', function () {
          const shared = new ObjectElement({ title: 'shared title' });
          const element = new ArrayElement([shared, shared]);

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '[{"title":"shared title"},{"title":"shared title"}]');
        });

        specify('should serialize a self-referencing ObjectElement as null', function () {
          const element = new ObjectElement({ a: 1 });
          element.set('self', element);

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '{"a":1,"self":null}');
        });

        specify('should serialize a self-referencing ArrayElement as null', function () {
          const element = new ArrayElement([1]);
          element.push(element);

          const result = serialize(element, undefined, undefined, { preserveStyle: true });

          assert.strictEqual(result, '[1,null]');
        });
      });
    });
  });
});
