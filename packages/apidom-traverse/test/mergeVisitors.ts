import { assert } from 'chai';
import {
  ObjectElement,
  StringElement,
  NumberElement,
  ArrayElement,
} from '@speclynx/apidom-datamodel';

import { traverse, mergeVisitors, mergeVisitorsAsync, Path } from '../src/index.ts';

describe('mergeVisitors', function () {
  context('basic merging', function () {
    specify('should call all visitors for each node', function () {
      const root = new StringElement('test');
      const visitor1Calls: string[] = [];
      const visitor2Calls: string[] = [];

      const visitor1 = {
        StringElement() {
          visitor1Calls.push('enter');
        },
      };

      const visitor2 = {
        StringElement() {
          visitor2Calls.push('enter');
        },
      };

      const merged = mergeVisitors([visitor1, visitor2]);
      traverse(root, merged);

      assert.deepEqual(visitor1Calls, ['enter']);
      assert.deepEqual(visitor2Calls, ['enter']);
    });

    specify('should call enter and leave for all visitors', function () {
      const root = new StringElement('test');
      const events: string[] = [];

      const visitor1 = {
        StringElement: {
          enter() {
            events.push('v1:enter');
          },
          leave() {
            events.push('v1:leave');
          },
        },
      };

      const visitor2 = {
        StringElement: {
          enter() {
            events.push('v2:enter');
          },
          leave() {
            events.push('v2:leave');
          },
        },
      };

      const merged = mergeVisitors([visitor1, visitor2]);
      traverse(root, merged);

      assert.deepEqual(events, ['v1:enter', 'v2:enter', 'v1:leave', 'v2:leave']);
    });
  });

  context('replacement behavior', function () {
    context('with exposeEdits=false (default)', function () {
      specify('should stop after first replacement', function () {
        const root = new StringElement('test');
        const calls: string[] = [];

        const visitor1 = {
          StringElement(path: Path) {
            calls.push('v1');
            path.replaceWith(new StringElement('replaced'));
          },
        };

        const visitor2 = {
          StringElement() {
            calls.push('v2');
          },
        };

        const merged = mergeVisitors([visitor1, visitor2]);
        traverse(root, merged);

        // v2 should NOT be called because v1 replaced the node
        assert.deepEqual(calls, ['v1']);
      });
    });

    context('with exposeEdits=true', function () {
      specify('should pass edited node to subsequent visitors', function () {
        const root = new StringElement('original');
        const values: string[] = [];

        const visitor1 = {
          StringElement(path: Path) {
            values.push((path.node as StringElement).toValue() as string);
            path.replaceWith(new StringElement('modified'));
          },
        };

        const visitor2 = {
          StringElement(path: Path) {
            values.push((path.node as StringElement).toValue() as string);
          },
        };

        const merged = mergeVisitors([visitor1, visitor2], { exposeEdits: true });
        traverse(root, merged);

        assert.deepEqual(values, ['original', 'modified']);
      });
    });
  });

  context('removal behavior', function () {
    specify('should stop processing when node is removed', function () {
      const root = new StringElement('test');
      const calls: string[] = [];

      const visitor1 = {
        StringElement(path: Path) {
          calls.push('v1');
          path.remove();
        },
      };

      const visitor2 = {
        StringElement() {
          calls.push('v2');
        },
      };

      const merged = mergeVisitors([visitor1, visitor2]);
      traverse(root, merged);

      assert.deepEqual(calls, ['v1']);
    });
  });

  context('skip behavior', function () {
    specify('should track skip state per visitor', function () {
      const root = new ObjectElement({ name: 'test' });
      const v1Nodes: string[] = [];
      const v2Nodes: string[] = [];

      const visitor1 = {
        enter(path: Path) {
          const el = path.node.element;
          v1Nodes.push(el);
          if (el === 'object') {
            path.skip();
          }
        },
      };

      const visitor2 = {
        enter(path: Path) {
          v2Nodes.push(path.node.element);
        },
      };

      const merged = mergeVisitors([visitor1, visitor2]);
      traverse(root, merged);

      // v1 skipped children of object
      assert.deepEqual(v1Nodes, ['object']);
      // v2 still sees all nodes
      assert.deepEqual(v2Nodes, ['object', 'member', 'string', 'string']);
    });
  });

  context('stop behavior', function () {
    specify('should stop specific visitor and break current node processing', function () {
      const root = new ArrayElement([1, 2, 3]);
      const v1Values: number[] = [];
      const v2Values: number[] = [];

      const visitor1 = {
        NumberElement(path: Path) {
          const val = (path.node as NumberElement).toValue() as number;
          v1Values.push(val);
          if (val === 2) {
            path.stop();
          }
        },
      };

      const visitor2 = {
        NumberElement(path: Path) {
          v2Values.push((path.node as NumberElement).toValue() as number);
        },
      };

      const merged = mergeVisitors([visitor1, visitor2]);
      traverse(root, merged);

      // v1 stopped at 2
      assert.deepEqual(v1Values, [1, 2]);
      // v2 sees 1 and 3, but not 2 (stop breaks current node processing)
      assert.deepEqual(v2Values, [1, 3]);
    });
  });

  context('return value replacement', function () {
    specify('should support returning replacement value', function () {
      const root = new StringElement('original');

      const visitor1 = {
        StringElement() {
          return new StringElement('replaced');
        },
      };

      const visitor2 = {
        StringElement() {
          // Should not be called
          throw new Error('Should not reach visitor2');
        },
      };

      const merged = mergeVisitors([visitor1, visitor2]);
      const result = traverse(root, merged);

      assert.strictEqual((result as StringElement).toValue(), 'replaced');
    });
  });
});

describe('mergeVisitorsAsync', function () {
  specify('should support async visitors', async function () {
    const root = new StringElement('test');
    const calls: string[] = [];

    const visitor1 = {
      async StringElement() {
        await new Promise((resolve) => setTimeout(resolve, 1));
        calls.push('v1');
      },
    };

    const visitor2 = {
      async StringElement() {
        await new Promise((resolve) => setTimeout(resolve, 1));
        calls.push('v2');
      },
    };

    const merged = mergeVisitorsAsync([visitor1, visitor2]);
    // Use traverseAsync indirectly through enter/leave
    if (merged.enter) {
      const path = new (await import('../src/Path.ts')).Path(
        root,
        undefined,
        null,
        undefined,
        false,
      );
      await merged.enter(path);
    }

    assert.deepEqual(calls, ['v1', 'v2']);
  });

  specify('should handle async replacement with exposeEdits=true', async function () {
    const root = new StringElement('original');
    const values: string[] = [];

    const visitor1 = {
      async StringElement(path: Path) {
        await new Promise((resolve) => setTimeout(resolve, 1));
        values.push((path.node as StringElement).toValue() as string);
        path.replaceWith(new StringElement('modified'));
      },
    };

    const visitor2 = {
      async StringElement(path: Path) {
        await new Promise((resolve) => setTimeout(resolve, 1));
        values.push((path.node as StringElement).toValue() as string);
      },
    };

    const merged = mergeVisitorsAsync([visitor1, visitor2], { exposeEdits: true });
    if (merged.enter) {
      const path = new (await import('../src/Path.ts')).Path(
        root,
        undefined,
        null,
        undefined,
        false,
      );
      await merged.enter(path);
    }

    assert.deepEqual(values, ['original', 'modified']);
  });
});
