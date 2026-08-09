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

    context('given NumberElement with exponential rawContent', function () {
      specify('should preserve original representation verbatim', function () {
        const element = new ObjectElement({});
        const numElement = new NumberElement(10000000000);
        numElement.style = { yaml: { scalarStyle: 'Plain', indent: 2, rawContent: '1.0e10' } };
        element.set('key', numElement);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'key: 1.0e10\n');
      });
    });

    context('given NumberElement with hex rawContent', function () {
      specify('should preserve original representation verbatim', function () {
        const element = new ObjectElement({});
        const numElement = new NumberElement(26);
        numElement.style = { yaml: { scalarStyle: 'Plain', indent: 2, rawContent: '0x1A' } };
        element.set('key', numElement);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'key: 0x1A\n');
      });
    });

    context('given NumberElement with stale rawContent', function () {
      // a plugin changed the value but left the original rawContent behind;
      // the stale text must not be emitted — fall back to format hints
      specify('should fall back to format-preserving serialization', function () {
        const element = new ObjectElement({});
        const numElement = new NumberElement(2000);
        numElement.style = { yaml: { scalarStyle: 'Plain', indent: 2, rawContent: '1e3' } };
        element.set('key', numElement);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'key: 2e+3\n');
      });
    });

    context('given NumberElement with rawContent inside a flow sequence', function () {
      specify('should preserve original representation verbatim', function () {
        const numElement = new NumberElement(1000);
        numElement.style = { yaml: { scalarStyle: 'Plain', indent: 2, rawContent: '1e3' } };
        const element = new ArrayElement([numElement, 2]);
        element.style = { yaml: { styleGroup: 'Flow', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, '[ 1e3, 2 ]\n');
      });
    });

    context('given NumberElement with octal rawContent', function () {
      specify('should preserve octal format', function () {
        const element = new ObjectElement({});
        const numElement = new NumberElement(15);
        numElement.style = { yaml: { scalarStyle: 'Plain', indent: 2, rawContent: '0o17' } };
        element.set('key', numElement);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'key: 0o17\n');
      });
    });

    context('given NumberElement with fractional digits', function () {
      specify('should preserve fraction digits', function () {
        const element = new ObjectElement({});
        const numElement = new NumberElement(1);
        numElement.style = { yaml: { scalarStyle: 'Plain', indent: 2, rawContent: '1.0' } };
        element.set('key', numElement);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'key: 1.0\n');
      });
    });

    context('given NumberElement without rawContent', function () {
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
        element.style = { yaml: { styleGroup: 'Block', indent: 2, comment: ' my comment' } };

        const result = serialize(element, { preserveStyle: true });

        assert.include(result, '# my comment');
      });
    });

    context('given element with commentBefore', function () {
      specify('should preserve comment before node', function () {
        const element = new ObjectElement({ a: 1 });
        element.style = {
          yaml: { styleGroup: 'Block', indent: 2, commentBefore: ' before comment' },
        };

        const result = serialize(element, { preserveStyle: true });

        assert.include(result, '# before comment');
      });
    });

    context('given element with empty comment', function () {
      specify('should emit a bare "#" for the single-space encoding', function () {
        const element = new ObjectElement({ a: 1 });
        element.style = { yaml: { styleGroup: 'Block', indent: 2, comment: ' ' } };

        const result = serialize(element, { preserveStyle: true });

        assert.include(result, '#');
        assert.notInclude(result, '# ');
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
