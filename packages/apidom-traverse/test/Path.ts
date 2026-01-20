import { assert } from 'chai';
import { StringElement, ObjectElement } from '@speclynx/apidom-datamodel';

import { Path, traverse } from '../src/index.ts';

describe('Path', function () {
  context('constructor', function () {
    specify('should set node property', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, undefined, false);

      assert.strictEqual(path.node, node);
    });

    specify('should set parent property', function () {
      const parent = new StringElement('parent');
      const node = new StringElement('child');
      const path = new Path(node, parent, null, 'key', false);

      assert.strictEqual(path.parent, parent);
    });

    specify('should set key property', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, 'myKey', false);

      assert.strictEqual(path.key, 'myKey');
    });

    specify('should set index when inList=true and key is number', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, 2, true);

      assert.strictEqual(path.index, 2);
    });

    specify('should have undefined index when inList=false', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, 2, false);

      assert.isUndefined(path.index);
    });

    specify('should set inList property', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, 0, true);

      assert.isTrue(path.inList);
    });
  });

  context('isRoot()', function () {
    context('given root path', function () {
      specify('should return true', function () {
        const node = new StringElement('test');
        const path = new Path(node, undefined, null, undefined, false);

        assert.isTrue(path.isRoot());
      });
    });

    context('given non-root path', function () {
      specify('should return false', function () {
        const parentNode = new StringElement('parent');
        const parentPath = new Path(parentNode, undefined, null, undefined, false);
        const node = new StringElement('child');
        const path = new Path(node, parentNode, parentPath, 'key', false);

        assert.isFalse(path.isRoot());
      });
    });
  });

  context('depth', function () {
    context('given root path', function () {
      specify('should return 0', function () {
        const node = new StringElement('test');
        const path = new Path(node, undefined, null, undefined, false);

        assert.strictEqual(path.depth, 0);
      });
    });

    context('given path with one ancestor', function () {
      specify('should return 1', function () {
        const rootNode = new StringElement('root');
        const rootPath = new Path(rootNode, undefined, null, undefined, false);
        const childNode = new StringElement('child');
        const childPath = new Path(childNode, rootNode, rootPath, 'key', false);

        assert.strictEqual(childPath.depth, 1);
      });
    });

    context('given path with multiple ancestors', function () {
      specify('should return correct depth', function () {
        const root = new StringElement('root');
        const rootPath = new Path(root, undefined, null, undefined, false);

        const level1 = new StringElement('level1');
        const level1Path = new Path(level1, root, rootPath, 'a', false);

        const level2 = new StringElement('level2');
        const level2Path = new Path(level2, level1, level1Path, 'b', false);

        const level3 = new StringElement('level3');
        const level3Path = new Path(level3, level2, level2Path, 'c', false);

        assert.strictEqual(level3Path.depth, 3);
      });
    });
  });

  context('getAncestry()', function () {
    specify('should return empty array for root', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, undefined, false);

      assert.deepEqual(path.getAncestry(), []);
    });

    specify('should return ancestors from nearest to root', function () {
      const root = new StringElement('root');
      const rootPath = new Path(root, undefined, null, undefined, false);

      const level1 = new StringElement('level1');
      const level1Path = new Path(level1, root, rootPath, 'a', false);

      const level2 = new StringElement('level2');
      const level2Path = new Path(level2, level1, level1Path, 'b', false);

      const ancestry = level2Path.getAncestry();

      assert.lengthOf(ancestry, 2);
      assert.strictEqual(ancestry[0], level1Path);
      assert.strictEqual(ancestry[1], rootPath);
    });
  });

  context('getAncestorNodes()', function () {
    specify('should return ancestor nodes', function () {
      const root = new StringElement('root');
      const rootPath = new Path(root, undefined, null, undefined, false);

      const level1 = new StringElement('level1');
      const level1Path = new Path(level1, root, rootPath, 'a', false);

      const level2 = new StringElement('level2');
      const level2Path = new Path(level2, level1, level1Path, 'b', false);

      const nodes = level2Path.getAncestorNodes();

      assert.lengthOf(nodes, 2);
      assert.strictEqual(nodes[0], level1);
      assert.strictEqual(nodes[1], root);
    });
  });

  context('getPathKeys()', function () {
    specify('should return empty array for root', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, undefined, false);

      assert.deepEqual(path.getPathKeys(), []);
    });

    context('ApiDOM semantic path extraction', function () {
      specify('should extract semantic paths during traversal', function () {
        // Create an OpenAPI-like structure
        const doc = new ObjectElement({
          openapi: '3.1.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
          paths: {
            '/pets': {
              get: {
                summary: 'List pets',
              },
            },
          },
        });

        const collectedPaths: { keys: PropertyKey[]; pointer: string; jsonpath: string }[] = [];

        traverse(doc, {
          StringElement(path: Path) {
            collectedPaths.push({
              keys: path.getPathKeys(),
              pointer: path.formatPath('jsonpointer'),
              jsonpath: path.formatPath('jsonpath'),
            });
          },
        });

        // Check specific paths
        const openapiPath = collectedPaths.find((p) => p.keys[0] === 'openapi');
        assert.deepEqual(openapiPath?.keys, ['openapi']);
        assert.strictEqual(openapiPath?.pointer, '/openapi');
        assert.strictEqual(openapiPath?.jsonpath, "$['openapi']");

        const titlePath = collectedPaths.find((p) => p.keys.includes('title'));
        assert.deepEqual(titlePath?.keys, ['info', 'title']);
        assert.strictEqual(titlePath?.pointer, '/info/title');
        assert.strictEqual(titlePath?.jsonpath, "$['info']['title']");

        const summaryPath = collectedPaths.find((p) => p.keys.includes('summary'));
        assert.deepEqual(summaryPath?.keys, ['paths', '/pets', 'get', 'summary']);
        assert.strictEqual(summaryPath?.pointer, '/paths/~1pets/get/summary');
        assert.strictEqual(summaryPath?.jsonpath, "$['paths']['/pets']['get']['summary']");
      });

      specify('should handle array indices in paths', function () {
        const doc = new ObjectElement({
          tags: ['pet', 'store', 'user'],
          parameters: [{ name: 'id' }, { name: 'limit' }],
        });

        const collectedPaths: { keys: PropertyKey[]; pointer: string }[] = [];

        traverse(doc, {
          StringElement(path: Path) {
            collectedPaths.push({
              keys: path.getPathKeys(),
              pointer: path.formatPath('jsonpointer'),
            });
          },
        });

        // Check array item paths
        const petPath = collectedPaths.find((p) => p.pointer === '/tags/0');
        assert.deepEqual(petPath?.keys, ['tags', 0]);

        const storePath = collectedPaths.find((p) => p.pointer === '/tags/1');
        assert.deepEqual(storePath?.keys, ['tags', 1]);

        const idPath = collectedPaths.find((p) => p.pointer === '/parameters/0/name');
        assert.deepEqual(idPath?.keys, ['parameters', 0, 'name']);

        const limitPath = collectedPaths.find((p) => p.pointer === '/parameters/1/name');
        assert.deepEqual(limitPath?.keys, ['parameters', 1, 'name']);
      });
    });
  });

  context('findParent()', function () {
    specify('should find matching parent', function () {
      const root = new StringElement('root');
      const rootPath = new Path(root, undefined, null, undefined, false);

      const level1 = new StringElement('level1');
      const level1Path = new Path(level1, root, rootPath, 'a', false);

      const level2 = new StringElement('level2');
      const level2Path = new Path(level2, level1, level1Path, 'b', false);

      const found = level2Path.findParent((p) => p.key === 'a');

      assert.strictEqual(found, level1Path);
    });

    specify('should return null if no match', function () {
      const root = new StringElement('root');
      const rootPath = new Path(root, undefined, null, undefined, false);

      const child = new StringElement('child');
      const childPath = new Path(child, root, rootPath, 'a', false);

      const found = childPath.findParent((p) => p.key === 'nonexistent');

      assert.isNull(found);
    });
  });

  context('find()', function () {
    specify('should return self if predicate matches', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, 'myKey', false);

      const found = path.find((p) => p.key === 'myKey');

      assert.strictEqual(found, path);
    });

    specify('should search parents if self does not match', function () {
      const root = new StringElement('root');
      const rootPath = new Path(root, undefined, null, undefined, false);

      const child = new StringElement('child');
      const childPath = new Path(child, root, rootPath, 'a', false);

      const found = childPath.find((p) => p.isRoot());

      assert.strictEqual(found, rootPath);
    });
  });

  context('skip()', function () {
    specify('should set shouldSkip to true', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, undefined, false);

      assert.isFalse(path.shouldSkip);
      path.skip();
      assert.isTrue(path.shouldSkip);
    });
  });

  context('stop()', function () {
    specify('should set shouldStop to true', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, undefined, false);

      assert.isFalse(path.shouldStop);
      path.stop();
      assert.isTrue(path.shouldStop);
    });
  });

  context('replaceWith()', function () {
    specify('should update node', function () {
      const node = new StringElement('old');
      const path = new Path(node, undefined, null, undefined, false);
      const replacement = new StringElement('new');

      path.replaceWith(replacement);

      assert.strictEqual(path.node, replacement);
    });

    specify('should mark as replaced', function () {
      const node = new StringElement('old');
      const path = new Path(node, undefined, null, undefined, false);
      const replacement = new StringElement('new');

      path.replaceWith(replacement);

      assert.isTrue(path._wasReplaced());
      assert.strictEqual(path._getReplacementNode(), replacement);
    });
  });

  context('remove()', function () {
    specify('should set removed to true', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, undefined, false);

      assert.isFalse(path.removed);
      path.remove();
      assert.isTrue(path.removed);
    });
  });

  context('_reset()', function () {
    specify('should reset all flags', function () {
      const node = new StringElement('test');
      const path = new Path(node, undefined, null, undefined, false);
      const replacement = new StringElement('new');

      path.skip();
      path.stop();
      path.remove();
      path.replaceWith(replacement);

      path._reset();

      assert.isFalse(path.shouldSkip);
      assert.isFalse(path.shouldStop);
      assert.isFalse(path.removed);
      assert.isFalse(path._wasReplaced());
      assert.isUndefined(path._getReplacementNode());
    });
  });
});
