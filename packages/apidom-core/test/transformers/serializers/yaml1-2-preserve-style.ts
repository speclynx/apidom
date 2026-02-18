import { assert } from 'chai';
import {
  ObjectElement,
  ArrayElement,
  StringElement,
  NumberElement,
} from '@speclynx/apidom-datamodel';

import serialize from '../../../src/transformers/serializers/yaml-1-2.ts';

describe('serializers', function () {
  context('yaml-1-2 preserveStyle', function () {
    context('given ObjectElement with block style', function () {
      specify('should preserve block mapping', function () {
        const element = new ObjectElement({ a: 1, b: 'hello' });
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: 1\nb: hello\n');
      });
    });

    context('given ObjectElement with flow style', function () {
      specify('should preserve flow mapping', function () {
        const element = new ObjectElement({ a: 1 });
        element.style = { yaml: { styleGroup: 'Flow', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, '{ a: 1 }\n');
      });
    });

    context('given ArrayElement with flow style', function () {
      specify('should preserve flow sequence', function () {
        const element = new ArrayElement([1, 2, 3]);
        element.style = { yaml: { styleGroup: 'Flow', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, '[ 1, 2, 3 ]\n');
      });
    });

    context('given StringElement with double-quoted style', function () {
      specify('should preserve double quoting', function () {
        const element = new ObjectElement({});
        const strElement = new StringElement('hello');
        strElement.style = { yaml: { scalarStyle: 'DoubleQuoted', indent: 2 } };
        element.set('key', strElement);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'key: "hello"\n');
      });
    });

    context('given StringElement with single-quoted style', function () {
      specify('should preserve single quoting', function () {
        const element = new ObjectElement({});
        const strElement = new StringElement('hello');
        strElement.style = { yaml: { scalarStyle: 'SingleQuoted', indent: 2 } };
        element.set('key', strElement);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, "key: 'hello'\n");
      });
    });

    context('given NumberElement with rawContent (not used by yaml serializer)', function () {
      specify('should serialize number', function () {
        const element = new ObjectElement({});
        const numElement = new NumberElement(42);
        numElement.style = { yaml: { scalarStyle: 'Plain', indent: 2 } };
        element.set('key', numElement);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'key: 42\n');
      });
    });

    context('given nested structure with indent', function () {
      specify('should preserve indentation from style', function () {
        const inner = new ObjectElement({ c: true });
        inner.style = { yaml: { styleGroup: 'Block', indent: 4 } };

        const outer = new ObjectElement({});
        outer.set('a', 1);
        outer.set('b', inner);
        outer.style = { yaml: { styleGroup: 'Block', indent: 4 } };

        const result = serialize(outer, { preserveStyle: true });

        assert.strictEqual(result, 'a: 1\nb:\n    c: true\n');
      });
    });

    context('given element with comment', function () {
      specify('should preserve inline comment', function () {
        const element = new ObjectElement({ a: 1 });
        element.style = { yaml: { styleGroup: 'Block', indent: 2, comment: 'my comment' } };

        const result = serialize(element, { preserveStyle: true });

        assert.include(result, '#my comment');
      });
    });

    context('given element with commentBefore', function () {
      specify('should preserve comment before node', function () {
        const element = new ObjectElement({ a: 1 });
        element.style = {
          yaml: { styleGroup: 'Block', indent: 2, commentBefore: 'before comment' },
        };

        const result = serialize(element, { preserveStyle: true });

        assert.include(result, '#before comment');
      });
    });

    context('given no style on element', function () {
      specify('should fall back to defaults', function () {
        const element = new ObjectElement({ a: 'b' });

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: b\n');
      });
    });

    context('given empty ObjectElement', function () {
      specify('should serialize to empty object', function () {
        const element = new ObjectElement({});
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, '{}\n');
      });
    });

    context('given empty ArrayElement', function () {
      specify('should serialize to empty array', function () {
        const element = new ArrayElement([]);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, '[]\n');
      });
    });
  });
});
