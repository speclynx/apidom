import { assert } from 'chai';
import {
  ObjectElement,
  ArrayElement,
  StringElement,
  NumberElement,
  type Element,
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

    context('given the same element instance referenced twice', function () {
      specify('should expand every occurrence', function () {
        const shared = new ObjectElement({ title: 'shared title' });
        const element = new ObjectElement({ a: new ObjectElement(), b: new ObjectElement() });
        (element.get('a') as ObjectElement).set('schema', shared);
        (element.get('b') as ObjectElement).set('schema', shared);

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(
          result,
          'a:\n  schema:\n    title: shared title\nb:\n  schema:\n    title: shared title\n',
        );
      });
    });

    context('given the same element instance referenced twice within an ArrayElement', function () {
      specify('should expand every occurrence', function () {
        const shared = new ObjectElement({ title: 'shared title' });
        const element = new ArrayElement([shared, shared]);

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, '- title: shared title\n- title: shared title\n');
      });
    });

    context('given a self-referencing ObjectElement', function () {
      specify('should terminate and serialize the cycle as null', function () {
        const element = new ObjectElement({ a: 1 });
        element.set('self', element);

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: 1\nself: null\n');
      });
    });

    context('given a self-referencing ArrayElement', function () {
      specify('should terminate and serialize the cycle as null', function () {
        const element = new ArrayElement([1]);
        element.push(element);

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, '- 1\n- null\n');
      });
    });

    context('given an indirect cycle', function () {
      specify('should terminate and serialize the cycle as null', function () {
        const a = new ObjectElement({ name: 'a' });
        const b = new ObjectElement({ name: 'b' });
        a.set('b', b);
        b.set('a', a);

        const result = serialize(a, { preserveStyle: true });

        assert.strictEqual(result, 'name: a\nb:\n  name: b\n  a: null\n');
      });
    });

    context('given a shared element reached from inside a cyclic branch', function () {
      specify('should expand the shared element and terminate the cycle', function () {
        const shared = new ObjectElement({ title: 'shared title' });
        const cyclic = new ObjectElement({ name: 'cyclic' });
        cyclic.set('self', cyclic);
        cyclic.set('schema', shared);
        const element = new ObjectElement({ cyclic, schema: shared });

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(
          result,
          'cyclic:\n  name: cyclic\n  self: null\n  schema:\n    title: shared title\nschema:\n  title: shared title\n',
        );
      });
    });

    context('given aliasDuplicateObjects', function () {
      specify('should emit an anchor and alias for a shared ObjectElement', function () {
        const shared = new ObjectElement({ title: 'shared' });
        const element = new ObjectElement();
        element.set('a', shared);
        element.set('b', shared);

        const result = serialize(element, { preserveStyle: true, aliasDuplicateObjects: true });

        assert.strictEqual(result, 'a: &a1\n  title: shared\nb: *a1\n');
      });

      specify('should emit an anchor and alias for a shared ArrayElement', function () {
        const shared = new ArrayElement([1, 2]);
        const element = new ObjectElement();
        element.set('a', shared);
        element.set('b', shared);

        const result = serialize(element, { preserveStyle: true, aliasDuplicateObjects: true });

        assert.strictEqual(result, 'a: &a1\n  - 1\n  - 2\nb: *a1\n');
      });

      specify('should give each shared element its own anchor', function () {
        const first = new ObjectElement({ n: 1 });
        const second = new ObjectElement({ n: 2 });
        const element = new ObjectElement();
        element.set('a', first);
        element.set('b', second);
        element.set('c', first);
        element.set('d', second);

        const result = serialize(element, { preserveStyle: true, aliasDuplicateObjects: true });

        assert.strictEqual(result, 'a: &a1\n  n: 1\nb: &a2\n  n: 2\nc: *a1\nd: *a2\n');
      });

      specify('should expand every occurrence when not enabled', function () {
        const shared = new ObjectElement({ title: 'shared' });
        const element = new ObjectElement();
        element.set('a', shared);
        element.set('b', shared);

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a:\n  title: shared\nb:\n  title: shared\n');
      });

      specify('should represent a cycle with a recursive anchor', function () {
        const element = new ObjectElement({ a: 1 });
        element.set('self', element);

        const result = serialize(element, { preserveStyle: true, aliasDuplicateObjects: true });

        assert.strictEqual(result, '&a1\na: 1\nself: *a1\n');
      });

      specify('should represent an indirect cycle with a recursive anchor', function () {
        const a = new ObjectElement({ name: 'a' });
        const b = new ObjectElement({ name: 'b' });
        a.set('b', b);
        b.set('a', a);

        const result = serialize(a, { preserveStyle: true, aliasDuplicateObjects: true });

        assert.strictEqual(result, '&a1\nname: a\nb:\n  name: b\n  a: *a1\n');
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

    // https://github.com/speclynx/apidom/issues/631
    context('given empty YAML node', function () {
      const emptyNode = () => {
        const element = new StringElement('');
        element.classes = ['yaml-e-node', 'yaml-e-scalar'];
        element.style = { yaml: { scalarStyle: 'Plain' } };
        return element;
      };

      specify('should write mapping value back empty', function () {
        const element = new ObjectElement({ b: 'x' });
        element.set('a', emptyNode());
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'b: x\na:\n');
      });

      specify('should write sequence item back empty', function () {
        const element = new ArrayElement([emptyNode()]);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, '- \n');
      });

      specify('should write flow mapping value back empty', function () {
        const element = new ObjectElement();
        element.set('a', emptyNode());
        element.style = { yaml: { styleGroup: 'Flow', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, '{ a: }\n');
      });

      specify('should write changed value', function () {
        const element = new ObjectElement();
        const value = emptyNode();
        value.content = 'x';
        element.set('a', value);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: x\n');
      });

      specify('should write it back empty after null tag', function () {
        const element = new ObjectElement();
        const value = emptyNode();
        value.style = { yaml: { scalarStyle: 'Plain', tag: '!!null' } };
        element.set('a', value);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: !!null\n');
      });

      specify('should write it back empty after other explicit tag', function () {
        const element = new ObjectElement();
        const value = emptyNode();
        value.style = { yaml: { scalarStyle: 'Plain', tag: '!!str' } };
        element.set('a', value);
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: !!str\n');
      });

      specify('should write empty string without the class as ""', function () {
        const element = new ObjectElement({ a: '' });
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: ""\n');
      });
    });

    // https://github.com/speclynx/apidom/issues/639
    context('given YAML anchor', function () {
      const block = <T extends Element>(element: T, style = {}): T => {
        element.style = { yaml: { styleGroup: 'Block', indent: 2, ...style } };
        return element;
      };
      const plain = <T extends Element>(element: T, style = {}): T => {
        element.style = { yaml: { scalarStyle: 'Plain', ...style } };
        return element;
      };

      specify('should write anchor of scalar and collection', function () {
        const element = block(new ObjectElement());
        element.set('a', plain(new NumberElement(1), { anchor: 'x' }));
        element.set('b', block(new ObjectElement({ c: 1 }), { anchor: 'y' }));

        assert.strictEqual(serialize(element, { preserveStyle: true }), 'a: &x 1\nb: &y\n  c: 1\n');
      });

      specify('should write a repeated anchor name once', function () {
        const element = block(new ObjectElement());
        element.set('a', plain(new NumberElement(1), { anchor: 'x' }));
        element.set('b', plain(new NumberElement(2), { anchor: 'x' }));

        assert.strictEqual(serialize(element, { preserveStyle: true }), 'a: &x 1\nb: 2\n');
      });

      specify('should not generate alias anchor named like an earlier anchor', function () {
        const shared = block(new ObjectElement({ c: 1 }));
        const element = block(new ObjectElement());
        element.set('x', plain(new NumberElement(1), { anchor: 'a1' }));
        element.set('y', shared);
        element.set('z', shared);

        const result = serialize(element, { preserveStyle: true, aliasDuplicateObjects: true });

        assert.strictEqual(result, 'x: &a1 1\ny: &a2\n  c: 1\nz: *a2\n');
      });

      specify('should not write anchor named like an earlier alias anchor', function () {
        const shared = block(new ObjectElement({ c: 1 }));
        const element = block(new ObjectElement());
        element.set('y', shared);
        element.set('z', shared);
        element.set('x', plain(new NumberElement(1), { anchor: 'a1' }));

        const result = serialize(element, { preserveStyle: true, aliasDuplicateObjects: true });

        assert.strictEqual(result, 'y: &a1\n  c: 1\nz: *a1\nx: 1\n');
      });
    });

    // https://github.com/speclynx/apidom/issues/644
    context('given single pair in flow sequence', function () {
      const sequence = (mapping: ObjectElement, style = {}): ArrayElement => {
        mapping.style = { yaml: { styleGroup: 'Flow', indent: 2, singlePair: true, ...style } };
        const element = new ArrayElement([mapping, 'b']);
        element.style = { yaml: { styleGroup: 'Flow', indent: 2 } };
        return element;
      };

      specify('should write it as single pair', function () {
        const result = serialize(sequence(new ObjectElement({ a: 1 })), { preserveStyle: true });

        assert.strictEqual(result, '[ a: 1, b ]\n');
      });

      specify('should write it as mapping when it has more pairs', function () {
        const result = serialize(sequence(new ObjectElement({ a: 1, c: 2 })), {
          preserveStyle: true,
        });

        assert.strictEqual(result, '[ { a: 1, c: 2 }, b ]\n');
      });

      specify('should write comment before it', function () {
        const mapping = new ObjectElement({ a: 1 });
        const result = serialize(sequence(mapping, { commentBefore: ' c' }), {
          preserveStyle: true,
        });

        assert.strictEqual(result, '[\n  # c\n  a: 1,\n  b\n]\n');
      });

      specify('should write it as mapping when its key is too long to be implicit', function () {
        const mapping = new ObjectElement({ ['k'.repeat(1100)]: 1 });
        const result = serialize(sequence(mapping), { preserveStyle: true });

        assert.match(result, /^\[\n {2}\{/);
      });

      specify('should write it as mapping when its value is cut by a cycle', function () {
        const mapping = new ObjectElement();
        const element = sequence(mapping);
        mapping.set('k', element);

        assert.strictEqual(serialize(element, { preserveStyle: true }), '[ { k }, b ]\n');
      });

      specify('should write it as mapping when aliasing duplicate objects', function () {
        const result = serialize(sequence(new ObjectElement({ a: 1 })), {
          preserveStyle: true,
          aliasDuplicateObjects: true,
        });

        assert.strictEqual(result, '[ { a: 1 }, b ]\n');
      });
    });

    context('given explicit YAML tag', function () {
      const tagged = (element: Element, tag: string, scalarStyle?: string): Element => {
        element.style = { yaml: { styleGroup: 'Block', indent: 2, scalarStyle, tag } };
        return element;
      };

      specify('should write tag of scalar', function () {
        const element = new ObjectElement();
        element.set('a', tagged(new StringElement('1'), '!!str', 'Plain'));
        element.set('b', tagged(new NumberElement(1), '!!int', 'Plain'));
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: !!str 1\nb: !!int 1\n');
      });

      specify('should write tag of collection', function () {
        const element = new ObjectElement();
        element.set('a', tagged(new ObjectElement({ b: 1 }), '!!map'));
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: !!map\n  b: 1\n');
      });

      specify('should write verbatim and non-specific tags', function () {
        const element = new ObjectElement();
        element.set('a', tagged(new StringElement('1'), '!<tag:yaml.org,2002:str>', 'Plain'));
        element.set('b', tagged(new StringElement('1'), '!', 'Plain'));
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: !<tag:yaml.org,2002:str> 1\nb: ! 1\n');
      });

      specify('should drop tag the changed value no longer fits', function () {
        const element = new ObjectElement();
        element.set('a', tagged(new StringElement('x'), '!!int', 'Plain'));
        element.set('b', tagged(new NumberElement(1.5), '!!int', 'Plain'));
        element.set('c', tagged(new ArrayElement([1]), '!!map'));
        element.set('d', tagged(new NumberElement(1e21), '!!int', 'Plain'));
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: x\nb: 1.5\nc:\n  - 1\nd: 1e+21\n');
      });

      specify('should write tag alone when plain value was changed to empty', function () {
        const element = new ObjectElement();
        element.set('a', tagged(new StringElement(''), '!!str', 'Plain'));
        element.set('b', tagged(new StringElement(''), '!!str', 'DoubleQuoted'));
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: !!str\nb: !!str ""\n');
      });

      specify('should not write tag outside of the core schema', function () {
        const element = new ObjectElement();
        element.set('a', tagged(new StringElement('x'), '!!constructor', 'Plain'));
        element.set('b', tagged(new StringElement('x'), '!!__proto__', 'Plain'));
        element.style = { yaml: { styleGroup: 'Block', indent: 2 } };

        const result = serialize(element, { preserveStyle: true });

        assert.strictEqual(result, 'a: x\nb: x\n');
      });
    });
  });
});
