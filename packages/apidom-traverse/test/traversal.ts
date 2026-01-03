import { assert } from 'chai';
import {
  Element,
  ObjectElement,
  StringElement,
  NumberElement,
  ArrayElement,
  MemberElement,
} from '@speclynx/apidom-datamodel';

import { traverse, traverseAsync, Path } from '../src/index.ts';

describe('traverse', function () {
  context('basic traversal', function () {
    specify('should visit all nodes in depth-first order', function () {
      const root = new ObjectElement({ name: 'test' });
      const visited: string[] = [];

      traverse(root, {
        enter(path: Path) {
          visited.push(`enter:${(path.node as { element: string }).element}`);
        },
        leave(path: Path) {
          visited.push(`leave:${(path.node as { element: string }).element}`);
        },
      });

      assert.deepEqual(visited, [
        'enter:object',
        'enter:member',
        'enter:string',
        'leave:string',
        'enter:string',
        'leave:string',
        'leave:member',
        'leave:object',
      ]);
    });

    specify('should visit array elements', function () {
      const root = new ArrayElement([1, 2, 3]);
      const visited: number[] = [];

      traverse(root, {
        NumberElement(path: Path) {
          visited.push((path.node as NumberElement).toValue() as number);
        },
      });

      assert.deepEqual(visited, [1, 2, 3]);
    });
  });

  context('visitor patterns', function () {
    specify('should support type-specific visitors', function () {
      const root = new ObjectElement({ name: 'test', count: 42 });
      const strings: string[] = [];
      const numbers: number[] = [];

      traverse(root, {
        StringElement(path: Path) {
          strings.push((path.node as StringElement).toValue() as string);
        },
        NumberElement(path: Path) {
          numbers.push((path.node as NumberElement).toValue() as number);
        },
      });

      assert.deepEqual(strings, ['name', 'test', 'count']);
      assert.deepEqual(numbers, [42]);
    });

    specify('should support enter/leave on specific types', function () {
      const root = new StringElement('hello');
      const events: string[] = [];

      traverse(root, {
        StringElement: {
          enter() {
            events.push('enter');
          },
          leave() {
            events.push('leave');
          },
        },
      });

      assert.deepEqual(events, ['enter', 'leave']);
    });
  });

  context('path.skip()', function () {
    specify('should skip children when called in enter', function () {
      const root = new ObjectElement({ name: 'test' });
      const visited: string[] = [];

      traverse(root, {
        enter(path: Path) {
          visited.push((path.node as { element: string }).element);
          if ((path.node as { element: string }).element === 'object') {
            path.skip();
          }
        },
      });

      // Should only visit root, not children
      assert.deepEqual(visited, ['object']);
    });
  });

  context('path.stop()', function () {
    specify('should stop all traversal', function () {
      const root = new ArrayElement([1, 2, 3]);
      const visited: number[] = [];

      traverse(root, {
        NumberElement(path: Path) {
          const value = (path.node as NumberElement).toValue() as number;
          visited.push(value);
          if (value === 2) {
            path.stop();
          }
        },
      });

      assert.deepEqual(visited, [1, 2]);
    });
  });

  context('path.replaceWith()', function () {
    specify('should replace node immutably', function () {
      const root = new StringElement('old');
      const replacement = new StringElement('new');

      const result = traverse(root, {
        StringElement(path: Path) {
          path.replaceWith(replacement);
        },
      });

      assert.strictEqual(result, replacement);
      // Original should be unchanged
      assert.strictEqual(root.toValue(), 'old');
    });

    specify('should replace nested nodes in mutable mode', function () {
      const root = new ArrayElement([new StringElement('old'), new StringElement('keep')]);

      traverse(
        root,
        {
          StringElement(path: Path) {
            if ((path.node as StringElement).toValue() === 'old') {
              path.replaceWith(new StringElement('new'));
            }
          },
        },
        { mutable: true },
      );

      // Collect values from mutated root
      const values: string[] = [];
      traverse(root, {
        StringElement(path: Path) {
          values.push((path.node as StringElement).toValue() as string);
        },
      });
      assert.include(values, 'new');
      assert.include(values, 'keep');
      assert.notInclude(values, 'old');
    });
  });

  context('path.remove()', function () {
    specify('should remove node from array in mutable mode', function () {
      const root = new ArrayElement([1, 2, 3]);

      traverse(
        root,
        {
          NumberElement(path: Path) {
            if ((path.node as NumberElement).toValue() === 2) {
              path.remove();
            }
          },
        },
        { mutable: true },
      );

      // Collect remaining values from mutated root
      const values: number[] = [];
      traverse(root, {
        NumberElement(path: Path) {
          values.push((path.node as NumberElement).toValue() as number);
        },
      });
      assert.deepEqual(values, [1, 3]);
    });
  });

  context('return value replacement', function () {
    specify('should support returning replacement value', function () {
      const root = new StringElement('old');
      const replacement = new StringElement('new');

      const result = traverse(root, {
        StringElement() {
          return replacement;
        },
      });

      assert.strictEqual(result, replacement);
    });
  });

  context('mutable mode', function () {
    specify('should modify tree in place when mutable=true', function () {
      const root = new ObjectElement({ name: 'old' });

      traverse(
        root,
        {
          StringElement(path: Path) {
            if ((path.node as StringElement).toValue() === 'old') {
              path.replaceWith(new StringElement('new'));
            }
          },
        },
        { mutable: true },
      );

      // Original should be modified
      const content = root.content as Element[];
      const member = content[0] as MemberElement;
      assert.strictEqual((member.value as StringElement).toValue(), 'new');
    });
  });

  context('cycle detection', function () {
    specify('should skip cycles by default', function () {
      const root = new ObjectElement();
      // Create a cycle by making root contain itself
      root.set('self', root);

      const visited: unknown[] = [];

      // Should not throw or infinite loop
      traverse(root, {
        ObjectElement(path: Path) {
          visited.push(path.node);
        },
      });

      // Should only visit root once
      assert.lengthOf(visited, 1);
    });
  });

  context('state injection', function () {
    specify('should inject state into visitor', function () {
      const root = new StringElement('test');
      let capturedState: unknown;

      const visitor = {
        StringElement() {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          capturedState = (this as any).count;
        },
      };

      traverse(root, visitor, { state: { count: 42 } });

      assert.strictEqual(capturedState, 42);
    });
  });
});

describe('traverseAsync', function () {
  specify('should support async visitors', async function () {
    const root = new ArrayElement([1, 2, 3]);
    const visited: number[] = [];

    await traverseAsync(root, {
      async NumberElement(path: Path) {
        await new Promise((resolve) => setTimeout(resolve, 1));
        visited.push((path.node as NumberElement).toValue() as number);
      },
    });

    assert.deepEqual(visited, [1, 2, 3]);
  });

  specify('should support async replacement', async function () {
    const root = new StringElement('old');

    const result = await traverseAsync(root, {
      async StringElement(path: Path) {
        await new Promise((resolve) => setTimeout(resolve, 1));
        path.replaceWith(new StringElement('new'));
      },
    });

    assert.strictEqual((result as StringElement).toValue(), 'new');
  });
});
