import { assert } from 'chai';

import { from } from '../../../src/index.ts';
import serialize from '../../../src/transformers/serializers/yaml-1-2.ts';

describe('serializers', function () {
  context('yaml-1-2', function () {
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
  });
});
