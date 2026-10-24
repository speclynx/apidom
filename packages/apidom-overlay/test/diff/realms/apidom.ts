import { assert } from 'chai';
import {
  refract,
  isElement,
  isMemberElement,
  ParseResultElement,
} from '@speclynx/apidom-datamodel';
import type { Element, ObjectElement, ArrayElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { isOverlay1Element } from '@speclynx/apidom-ns-overlay-1';
import type { ActionElement } from '@speclynx/apidom-ns-overlay-1';

import { diffApiDOM } from '../../../src/diff/index.ts';
import { applyOverlay as applyOverlayApiDOM } from '../../../src/apply/realms/apidom.ts';
import OverlayError from '../../../src/errors/OverlayError.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyJson = Record<string, any>;

describe('diffApiDOM', function () {
  context('given identical documents', function () {
    specify('should produce an overlay with no actions by default', function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0' } });
      const right = refract({ info: { title: 'My API', version: '1.0.0' } });

      const overlay = diffApiDOM(left, right);

      assert.isTrue(isOverlay1Element(overlay));
      assert.strictEqual(overlay.actions?.length, 0);
    });

    specify("should produce an overlay with no actions when onEmptyDiff is 'allow'", function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0' } });
      const right = refract({ info: { title: 'My API', version: '1.0.0' } });

      const overlay = diffApiDOM(left, right, { onEmptyDiff: 'allow' });

      assert.strictEqual(overlay.actions?.length, 0);
    });

    specify("should throw OverlayError when onEmptyDiff is 'throw'", function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0' } });
      const right = refract({ info: { title: 'My API', version: '1.0.0' } });

      assert.throws(
        () => diffApiDOM(left, right, { onEmptyDiff: 'throw' }),
        OverlayError,
        /identical/i,
      );
    });
  });

  // https://github.com/speclynx/apidom/issues/631
  context('given an empty YAML node changed to an empty string', function () {
    const emptyNode = (element: Element): Element => {
      element.classes.push('yaml-e-node');
      element.classes.push('yaml-e-scalar');
      return element;
    };

    specify('should produce update actions', function () {
      const left = refract({ a: '', b: [''] }) as ObjectElement;
      emptyNode(left.get('a')!);
      emptyNode((left.get('b') as ArrayElement).get(0)!);
      const right = refract({ a: '', b: [''] });

      const overlay = toValue(diffApiDOM(left, right)) as AnyJson;

      assert.deepEqual(overlay.actions, [
        { target: "$['a']", update: '' },
        { target: "$['b'][0]", update: '' },
      ]);
    });

    specify('should produce no actions between equal empty YAML nodes', function () {
      const left = refract({ a: '' }) as ObjectElement;
      emptyNode(left.get('a')!);
      const right = refract({ a: '' }) as ObjectElement;
      emptyNode(right.get('a')!);

      const overlay = toValue(diffApiDOM(left, right)) as AnyJson;

      assert.deepEqual(overlay.actions, []);
    });
  });

  context('given documents with a changed scalar field', function () {
    specify('should produce an update action targeting the field', function () {
      const left = refract({ info: { title: 'Old Title', version: '1.0.0' } });
      const right = refract({ info: { title: 'New Title', version: '1.0.0' } });

      const overlay = diffApiDOM(left, right);
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(overlay.actions?.length, 1);
      assert.strictEqual(value.actions[0].target, "$['info']['title']");
      assert.strictEqual(value.actions[0].update, 'New Title');
    });

    specify(
      'should produce an overlay that when applied yields the right document',
      async function () {
        const left = refract({ info: { title: 'Old Title', version: '1.0.0' } });
        const right = refract({ info: { title: 'New Title', version: '1.0.0' } });

        const overlay = diffApiDOM(left, right);
        const result = toValue(await applyOverlayApiDOM(overlay, left)) as AnyJson;

        assert.deepEqual(result, toValue(right));
      },
    );
  });

  context('given documents with an added field', function () {
    specify('should produce an update action on the parent', function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0' } });
      const right = refract({ info: { title: 'My API', version: '1.0.0', description: 'Docs' } });

      const overlay = diffApiDOM(left, right);
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(overlay.actions?.length, 1);
      assert.strictEqual(value.actions[0].target, "$['info']");
      assert.deepEqual(value.actions[0].update, { description: 'Docs' });
    });

    specify(
      'should produce an overlay that when applied yields the right document',
      async function () {
        const left = refract({ info: { title: 'My API', version: '1.0.0' } });
        const right = refract({ info: { title: 'My API', version: '1.0.0', description: 'Docs' } });

        const result = toValue(await applyOverlayApiDOM(diffApiDOM(left, right), left)) as AnyJson;

        assert.deepEqual(result, toValue(right));
      },
    );
  });

  context('given documents with a removed field', function () {
    specify('should produce a remove action targeting the field', function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0', description: 'Docs' } });
      const right = refract({ info: { title: 'My API', version: '1.0.0' } });

      const overlay = diffApiDOM(left, right);
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(overlay.actions?.length, 1);
      assert.strictEqual(value.actions[0].target, "$['info']['description']");
      assert.strictEqual(value.actions[0].remove, true);
    });

    specify(
      'should produce an overlay that when applied yields the right document',
      async function () {
        const left = refract({ info: { title: 'My API', version: '1.0.0', description: 'Docs' } });
        const right = refract({ info: { title: 'My API', version: '1.0.0' } });

        const result = toValue(await applyOverlayApiDOM(diffApiDOM(left, right), left)) as AnyJson;

        assert.deepEqual(result, toValue(right));
      },
    );
  });

  context('given documents with array changes', function () {
    context('item appended', function () {
      specify('should produce an update action on the array', function () {
        const left = refract({ servers: [{ url: 'https://api.example.com' }] });
        const right = refract({
          servers: [{ url: 'https://api.example.com' }, { url: 'https://staging.example.com' }],
        });

        const overlay = diffApiDOM(left, right);
        const value = toValue(overlay) as AnyJson;

        assert.strictEqual(overlay.actions?.length, 1);
        assert.strictEqual(value.actions[0].target, "$['servers']");
        assert.deepEqual(value.actions[0].update, [{ url: 'https://staging.example.com' }]);
      });

      specify(
        'should produce an overlay that when applied yields the right document',
        async function () {
          const left = refract({ servers: [{ url: 'https://api.example.com' }] });
          const right = refract({
            servers: [{ url: 'https://api.example.com' }, { url: 'https://staging.example.com' }],
          });

          const result = toValue(
            await applyOverlayApiDOM(diffApiDOM(left, right), left),
          ) as AnyJson;

          assert.deepEqual(result, toValue(right));
        },
      );
    });

    context('item removed', function () {
      specify('should produce a remove action on the last index', function () {
        const left = refract({
          servers: [{ url: 'https://api.example.com' }, { url: 'https://staging.example.com' }],
        });
        const right = refract({ servers: [{ url: 'https://api.example.com' }] });

        const overlay = diffApiDOM(left, right);
        const value = toValue(overlay) as AnyJson;

        assert.strictEqual(overlay.actions?.length, 1);
        assert.strictEqual(value.actions[0].target, "$['servers'][1]");
        assert.strictEqual(value.actions[0].remove, true);
      });

      specify(
        'should produce an overlay that when applied yields the right document',
        async function () {
          const left = refract({
            servers: [{ url: 'https://api.example.com' }, { url: 'https://staging.example.com' }],
          });
          const right = refract({ servers: [{ url: 'https://api.example.com' }] });

          const result = toValue(
            await applyOverlayApiDOM(diffApiDOM(left, right), left),
          ) as AnyJson;

          assert.deepEqual(result, toValue(right));
        },
      );
    });

    context('item changed in place', function () {
      specify('should produce an update action on the changed field', function () {
        const left = refract({ servers: [{ url: 'https://staging.example.com' }] });
        const right = refract({ servers: [{ url: 'https://prod.example.com' }] });

        const overlay = diffApiDOM(left, right);
        const value = toValue(overlay) as AnyJson;

        assert.strictEqual(overlay.actions?.length, 1);
        assert.strictEqual(value.actions[0].target, "$['servers'][0]['url']");
        assert.strictEqual(value.actions[0].update, 'https://prod.example.com');
      });

      specify(
        'should produce an overlay that when applied yields the right document',
        async function () {
          const left = refract({ servers: [{ url: 'https://staging.example.com' }] });
          const right = refract({ servers: [{ url: 'https://prod.example.com' }] });

          const result = toValue(
            await applyOverlayApiDOM(diffApiDOM(left, right), left),
          ) as AnyJson;

          assert.deepEqual(result, toValue(right));
        },
      );
    });

    context('middle item removed (cascading positional replacement)', function () {
      specify(
        'should produce an overlay that when applied yields the right document',
        async function () {
          const left = refract({ tags: ['a', 'b', 'c'] });
          const right = refract({ tags: ['a', 'c'] });

          const result = toValue(
            await applyOverlayApiDOM(diffApiDOM(left, right), left),
          ) as AnyJson;

          assert.deepEqual(result, toValue(right));
        },
      );
    });

    context('multiple items appended', function () {
      specify('should batch all appended items into a single update action', function () {
        const left = refract({ tags: ['a'] });
        const right = refract({ tags: ['a', 'b', 'c', 'd'] });

        const overlay = diffApiDOM(left, right);
        const value = toValue(overlay) as AnyJson;

        assert.strictEqual(overlay.actions?.length, 1);
        assert.strictEqual(value.actions[0].target, "$['tags']");
        assert.deepEqual(value.actions[0].update, ['b', 'c', 'd']);
      });

      specify(
        'should produce an overlay that when applied yields the right document',
        async function () {
          const left = refract({ tags: ['a'] });
          const right = refract({ tags: ['a', 'b', 'c', 'd'] });

          const result = toValue(
            await applyOverlayApiDOM(diffApiDOM(left, right), left),
          ) as AnyJson;

          assert.deepEqual(result, toValue(right));
        },
      );
    });
  });

  context('given a nested field structural type change', function () {
    specify('should produce remove + parent update actions', function () {
      const left = refract({ info: { count: 1 } });
      const right = refract({ info: { count: 'one' } });

      const overlay = diffApiDOM(left, right);
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(overlay.actions?.length, 2);
      assert.strictEqual(value.actions[0].target, "$['info']['count']");
      assert.strictEqual(value.actions[0].remove, true);
      assert.strictEqual(value.actions[1].target, "$['info']");
      assert.deepEqual(value.actions[1].update, { count: 'one' });
    });

    specify(
      'should produce an overlay that when applied yields the right document',
      async function () {
        const left = refract({ info: { count: 1 } });
        const right = refract({ info: { count: 'one' } });

        const result = toValue(await applyOverlayApiDOM(diffApiDOM(left, right), left)) as AnyJson;

        assert.deepEqual(result, toValue(right));
      },
    );
  });

  context('given documents with a changed scalar root', function () {
    specify('should emit a root-targeting update', function () {
      const overlay = diffApiDOM(refract('original'), refract('replaced'));
      const [action] = toValue(overlay.actions as ArrayElement) as AnyJson[];

      assert.strictEqual(action.target, '$');
      assert.strictEqual(action.update, 'replaced');
    });

    specify('should round-trip through a ParseResultElement target', async function () {
      const left = refract('original');
      left.classes.push('result');
      const parseResult = new ParseResultElement();
      parseResult.push(left);

      const overlay = diffApiDOM(refract('original'), refract('replaced'));
      const result = await applyOverlayApiDOM(overlay, parseResult, { immutable: false });

      // replacing a primitive root swaps in the update value's meta wholesale,
      // so the parse result must still be able to find its result element
      assert.isDefined(result.result);
      assert.strictEqual(toValue(result.result), 'replaced');
    });
  });

  context('given a root-level structural type change', function () {
    specify('should throw OverlayError', function () {
      const left = refract({ info: {} });
      const right = refract(['item']);

      assert.throws(() => diffApiDOM(left, right), OverlayError, /incompatible root types/i);
    });
  });

  context('given options', function () {
    specify('should use provided overlayVersion', function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0' } });
      const right = refract({ info: { title: 'My API', version: '2.0.0' } });

      for (const version of ['1.1.0', '1.2.0', '1.10.0']) {
        const overlay = diffApiDOM(left, right, { overlay: version });
        const value = toValue(overlay) as AnyJson;

        assert.strictEqual(value.overlay, version);
      }
    });

    specify('should throw OverlayError for overlay versions below 1.1.0', function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0' } });
      const right = refract({ info: { title: 'My API', version: '2.0.0' } });

      assert.throws(
        () => diffApiDOM(left, right, { overlay: '1.0.0' }),
        OverlayError,
        /Overlay >= 1\.1\.0/,
      );
    });

    specify('should throw OverlayError for malformed overlay versions', function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0' } });
      const right = refract({ info: { title: 'My API', version: '2.0.0' } });

      for (const version of ['', '1.1', '1.01.0', '2.0.0', 'latest']) {
        assert.throws(() => diffApiDOM(left, right, { overlay: version }), OverlayError);
      }
    });

    specify('should use provided info', function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0' } });
      const right = refract({ info: { title: 'My API', version: '2.0.0' } });

      const overlay = diffApiDOM(left, right, {
        info: { title: 'Migration v1 to v2', version: '1.0.0' },
      });
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(value.info.title, 'Migration v1 to v2');
      assert.strictEqual(value.info.version, '1.0.0');
    });

    specify('should use provided extendsUri', function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0' } });
      const right = refract({ info: { title: 'My API', version: '2.0.0' } });

      const overlay = diffApiDOM(left, right, { extends: 'https://example.com/openapi.yaml' });
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(value.extends, 'https://example.com/openapi.yaml');
    });

    specify('should use default info when not provided', function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0' } });
      const right = refract({ info: { title: 'My API', version: '2.0.0' } });

      const overlay = diffApiDOM(left, right);
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(value.overlay, '1.2.0');
      assert.strictEqual(value.info.title, 'API diff');
      assert.strictEqual(value.info.version, '0.0.0');
    });

    specify('should set info.description when provided', function () {
      const left = refract({ info: { title: 'My API', version: '1.0.0' } });
      const right = refract({ info: { title: 'My API', version: '2.0.0' } });

      const overlay = diffApiDOM(left, right, { info: { description: 'v1 to v2 migration' } });
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(value.info.description, 'v1 to v2 migration');
    });
  });

  context('element identity', function () {
    const collectMetaValue = (value: unknown, acc: Set<Element>): void => {
      if (isElement(value)) {
        collectElements(value, acc);
      } else if (Array.isArray(value)) {
        value.forEach((item) => collectMetaValue(item, acc));
      }
    };

    const collectElements = (element: Element, acc: Set<Element> = new Set()): Set<Element> => {
      if (acc.has(element)) return acc;
      acc.add(element);

      // meta values are plain JS values that may hold elements; attributes is an element
      Object.values(element.meta).forEach((value) => collectMetaValue(value, acc));
      if (element.attributes.length > 0) {
        collectElements(element.attributes, acc);
      }

      if (isMemberElement(element)) {
        collectElements(element.key as Element, acc);
        collectElements(element.value as Element, acc);
      } else if (Array.isArray(element.content)) {
        (element.content as Element[]).forEach((child) => collectElements(child, acc));
      } else if (isElement(element.content)) {
        collectElements(element.content as Element, acc);
      }

      return acc;
    };

    const assertDisjoint = (first: Element, second: Element): void => {
      const secondElements = collectElements(second);
      const shared = [...collectElements(first)].filter((element) => secondElements.has(element));

      assert.deepEqual(
        shared.map((element) => element.element),
        [],
      );
    };

    specify('should not share elements with the right document for added keys', function () {
      const left = refract({ info: { title: 'My API' } });
      const right = refract({ info: { title: 'My API' }, servers: [{ url: '/api' }] });

      const overlay = diffApiDOM(left, right);

      assertDisjoint(overlay, right);
    });

    specify(
      'should not share elements with the right document for changed primitives',
      function () {
        const left = refract({ info: { title: 'Old Title' } });
        const right = refract({ info: { title: 'New Title' } });

        const overlay = diffApiDOM(left, right);

        assertDisjoint(overlay, right);
      },
    );

    specify(
      'should not share elements with the right document for structural type changes',
      function () {
        const left = refract({ info: { title: 'My API' } });
        const right = refract({ info: ['My API'] });

        const overlay = diffApiDOM(left, right);

        assertDisjoint(overlay, right);
      },
    );

    specify('should not share elements with the right document for appended items', function () {
      const left = refract({ servers: [{ url: '/api' }] });
      const right = refract({ servers: [{ url: '/api' }, { url: '/api/v2' }] });

      const overlay = diffApiDOM(left, right);

      assertDisjoint(overlay, right);
    });

    specify(
      'should not share elements with the right document for array tail reconstruction',
      function () {
        const left = refract({ servers: ['/api', '/api/v2'] });
        const right = refract({ servers: ['/api', { url: '/api/v2' }] });

        const overlay = diffApiDOM(left, right);

        assertDisjoint(overlay, right);
      },
    );

    specify('should not share elements between two diffs of the same documents', function () {
      const left = refract({ info: { title: 'My API' } });
      const right = refract({ info: { title: 'My API' }, servers: [{ url: '/api' }] });

      assertDisjoint(diffApiDOM(left, right), diffApiDOM(left, right));
    });

    specify('should not propagate mutations of the overlay to the right document', function () {
      const left = refract({ info: { title: 'My API' } });
      const right = refract({ info: { title: 'My API' }, servers: [{ url: '/api' }] });

      const overlay = diffApiDOM(left, right);
      const action = overlay.actions!.get(0) as ActionElement;
      const update = action.update as ObjectElement;
      ((update.get('servers') as ArrayElement).get(0) as ObjectElement).set('url', 'MUTATED');

      assert.deepEqual(toValue(right), {
        info: { title: 'My API' },
        servers: [{ url: '/api' }],
      });
    });
  });
});
