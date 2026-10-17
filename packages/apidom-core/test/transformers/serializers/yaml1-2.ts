import { assert } from 'chai';

import {
  ObjectElement,
  MemberElement,
  NumberElement,
  StringElement,
} from '@speclynx/apidom-datamodel';

import { from } from '../../../src/index.ts';
import serialize from '../../../src/transformers/serializers/yaml-1-2.ts';

describe('serializers', function () {
  context('yaml-1-2', function () {
    // https://github.com/speclynx/apidom/issues/650
    context('given ObjectElement with number key', function () {
      specify('should write the key in string form', function () {
        const object = new ObjectElement();
        object.push(new MemberElement(new NumberElement(200), new StringElement('ok')));

        assert.strictEqual(serialize(object), '"200": ok\n');
      });
    });

    // https://github.com/speclynx/apidom/issues/664
    context('given block scalar with indentation indicator', function () {
      const element = from({ k: '  lead\nx\n', s: ['  lead\nx\n'] })!;

      specify('should write indicator of mapping value as indentation step', function () {
        assert.strictEqual(
          serialize(element, { indent: 4 }),
          'k: |4\n      lead\n    x\ns:\n    - |2\n        lead\n      x\n',
        );
        assert.strictEqual(
          serialize(element, { indent: 1 }),
          'k: |1\n   lead\n x\ns:\n - |2\n     lead\n   x\n',
        );
      });

      specify('should move content of indentation step over 9 to 9th column', function () {
        assert.strictEqual(
          serialize(element, { indent: 10 }),
          'k: |9\n           lead\n         x\ns:\n          - |2\n              lead\n            x\n',
        );
      });
    });

    context('given BooleanElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from(true)!;
        const serialized = serialize(apidom);

        assert.strictEqual(serialized, 'true\n');
      });
    });

    context('given NumberElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from(1)!;
        const serialized = serialize(apidom);

        assert.strictEqual(serialized, '1\n');
      });
    });

    context('given StringElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from('test')!;
        const serialized = serialize(apidom);

        assert.strictEqual(serialized, 'test\n');
      });

      context('and is multiline', function () {
        specify('should serialize to YAML 1.2', function () {
          const apidom = from('test\n\ntest\n')!;
          const serialized = serialize(apidom);

          assert.strictEqual(serialized, '|\ntest\n\ntest\n');
        });
      });
    });

    context('given NullElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from(null)!;
        const serialized = serialize(apidom);

        assert.strictEqual(serialized, 'null\n');
      });
    });

    context('given empty ArrayElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from([])!;
        const serialized = serialize(apidom);

        assert.strictEqual(serialized, '[]\n');
      });
    });

    context('given simple ArrayElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from([1, true, 'test', null])!;
        const serialized = serialize(apidom, { directive: true });

        assert.strictEqual(serialized, '%YAML 1.2\n---\n- 1\n- true\n- test\n- null\n');
      });
    });

    context('given nested ArrayElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from([1, [true, 'test', null]])!;
        const serialized = serialize(apidom, { directive: true });

        assert.strictEqual(serialized, '%YAML 1.2\n---\n- 1\n- - true\n  - test\n  - null\n');
      });
    });

    context('given ArrayElement in ObjectElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from({ a: [1] })!;
        const serialized = serialize(apidom, { directive: true });

        assert.strictEqual(serialized, '%YAML 1.2\n---\na:\n  - 1\n');
      });
    });

    context('given empty ObjectElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from({})!;
        const serialized = serialize(apidom);

        assert.strictEqual(serialized, '{}\n');
      });
    });

    context('given simple ObjectElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from({ a: 1, b: true })!;
        const serialized = serialize(apidom, { directive: true });

        assert.strictEqual(serialized, '%YAML 1.2\n---\na: 1\nb: true\n');
      });
    });

    context('given nested ObjectElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from({ a: 1, b: { c: true } })!;
        const serialized = serialize(apidom, { directive: true });

        assert.strictEqual(serialized, '%YAML 1.2\n---\na: 1\nb:\n  c: true\n');
      });
    });

    context('given ObjectElement in ArrayElement', function () {
      specify('should serialize to YAML 1.2', function () {
        const apidom = from([{ a: true }])!;
        const serialized = serialize(apidom, { directive: true });

        assert.strictEqual(serialized, '%YAML 1.2\n---\n- a: true\n');
      });
    });

    context('given a self-referencing ObjectElement', function () {
      specify('should serialize the cycle as null', function () {
        const element = new ObjectElement({ a: 1 });
        element.set('self', element);

        assert.strictEqual(serialize(element), 'a: 1\nself: null\n');
      });

      specify('should serialize the cycle as null with a directive', function () {
        const element = new ObjectElement({ a: 1 });
        element.set('self', element);

        assert.strictEqual(
          serialize(element, { directive: true }),
          '%YAML 1.2\n---\na: 1\nself: null\n',
        );
      });
    });

    context('given an indirect cycle', function () {
      specify('should serialize the cycle as null', function () {
        const a = new ObjectElement({ name: 'a' });
        const b = new ObjectElement({ name: 'b' });
        a.set('b', b);
        b.set('a', a);

        assert.strictEqual(serialize(a), 'name: a\nb:\n  name: b\n  a: null\n');
      });
    });

    context('given the same element instance referenced twice', function () {
      specify('should expand every occurrence rather than treating it as a cycle', function () {
        const shared = new ObjectElement({ title: 'shared' });
        const element = new ObjectElement();
        element.set('a', shared);
        element.set('b', shared);

        assert.strictEqual(serialize(element), 'a:\n  title: shared\nb:\n  title: shared\n');
      });
    });
  });
});
