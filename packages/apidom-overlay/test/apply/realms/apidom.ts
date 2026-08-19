import { assert, expect } from 'chai';
import { refract, ParseResultElement } from '@speclynx/apidom-datamodel';
import type { Element, ObjectElement, ArrayElement } from '@speclynx/apidom-datamodel';
import { toValue, toJSON } from '@speclynx/apidom-core';
import { refractAction, refractOverlay1 } from '@speclynx/apidom-ns-overlay-1';

import type { Overlay1Element } from '@speclynx/apidom-ns-overlay-1';

import {
  applyAction,
  applyOverlay as applyOverlayApiDOM,
} from '../../../src/apply/realms/apidom.ts';
import OverlayError from '../../../src/errors/OverlayError.ts';
import type { OverlayTrace } from '../../../src/apply/trace/types.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyJson = Record<string, any>;

describe('applyAction', function () {
  context('update action', function () {
    context('given object target', function () {
      specify('should merge new properties into existing object', function () {
        const action = refractAction({
          target: '$.info',
          update: { description: 'A comprehensive API' },
        });
        const target = refract({
          info: { title: 'My API', version: '1.0.0' },
        });

        const result = applyAction(action, target);
        const value = toValue(result) as AnyJson;

        assert.strictEqual(value.info.title, 'My API');
        assert.strictEqual(value.info.version, '1.0.0');
        assert.strictEqual(value.info.description, 'A comprehensive API');
      });

      specify('should overwrite existing properties', function () {
        const action = refractAction({
          target: '$.info',
          update: { title: 'Renamed API' },
        });
        const target = refract({
          info: { title: 'Original', version: '1.0.0' },
        });

        const result = applyAction(action, target);
        const value = toValue(result) as AnyJson;

        assert.strictEqual(value.info.title, 'Renamed API');
        assert.strictEqual(value.info.version, '1.0.0');
      });

      specify('should recursively merge nested objects', function () {
        const action = refractAction({
          target: '$.info',
          update: {
            contact: { url: 'https://example.com' },
          },
        });
        const target = refract({
          info: {
            title: 'API',
            contact: { name: 'Support', email: 'help@example.com' },
          },
        });

        const result = applyAction(action, target);
        const value = toValue(result) as AnyJson;

        assert.strictEqual(value.info.contact.name, 'Support');
        assert.strictEqual(value.info.contact.email, 'help@example.com');
        assert.strictEqual(value.info.contact.url, 'https://example.com');
      });

      specify('should not mutate the original target', function () {
        const action = refractAction({
          target: '$.info',
          update: { description: 'Added' },
        });
        const target = refract({
          info: { title: 'Original' },
        });

        applyAction(action, target);
        const value = toValue(target) as AnyJson;

        assert.isUndefined(value.info.description);
      });
    });

    context('given array target', function () {
      specify('should concatenate arrays', function () {
        const action = refractAction({
          target: '$.tags',
          update: [{ name: 'admin' }],
        });
        const target = refract({
          tags: [{ name: 'pets' }, { name: 'users' }],
        });

        const result = applyAction(action, target);
        const value = toValue(result) as AnyJson;

        assert.strictEqual(value.tags.length, 3);
        assert.strictEqual(value.tags[0].name, 'pets');
        assert.strictEqual(value.tags[1].name, 'users');
        assert.strictEqual(value.tags[2].name, 'admin');
      });

      specify('should concatenate multiple items', function () {
        const action = refractAction({
          target: '$.servers',
          update: [{ url: 'https://staging.example.com' }, { url: 'https://dev.example.com' }],
        });
        const target = refract({
          servers: [{ url: 'https://api.example.com' }],
        });

        const result = applyAction(action, target);
        const value = toValue(result) as AnyJson;

        assert.strictEqual(value.servers.length, 3);
      });
    });

    context('given primitive target', function () {
      specify('should replace string value', function () {
        const action = refractAction({
          target: '$.info.title',
          update: 'New Title',
        });
        const target = refract({
          info: { title: 'Old Title' },
        });

        const result = applyAction(action, target);
        const value = toValue(result) as AnyJson;

        assert.strictEqual(value.info.title, 'New Title');
      });

      specify('should replace boolean value', function () {
        const action = refractAction({
          target: '$.info.deprecated',
          update: true,
        });
        const target = refract({
          info: { deprecated: false },
        });

        const result = applyAction(action, target);
        const value = toValue(result) as AnyJson;

        assert.strictEqual(value.info.deprecated, true);
      });

      specify('should replace numeric value', function () {
        const action = refractAction({
          target: '$.retryCount',
          update: 5,
        });
        const target = refract({ retryCount: 3 });

        const result = applyAction(action, target);
        const value = toValue(result) as AnyJson;

        assert.strictEqual(value.retryCount, 5);
      });
    });

    context('given multiple target nodes via wildcard', function () {
      specify('should update all matched primitives', function () {
        const action = refractAction({
          target: '$.paths[*].get.summary',
          update: 'Updated',
        });
        const target = refract({
          paths: {
            '/pets': { get: { summary: 'List pets' } },
            '/users': { get: { summary: 'List users' } },
          },
        });

        const result = applyAction(action, target);
        const value = toValue(result) as AnyJson;

        assert.strictEqual(value.paths['/pets'].get.summary, 'Updated');
        assert.strictEqual(value.paths['/users'].get.summary, 'Updated');
      });

      specify('should merge into all matched objects', function () {
        const action = refractAction({
          target: '$.paths[*].get',
          update: { deprecated: true },
        });
        const target = refract({
          paths: {
            '/pets': { get: { summary: 'List pets' } },
            '/users': { get: { summary: 'List users' } },
          },
        });

        const result = applyAction(action, target);
        const value = toValue(result) as AnyJson;

        assert.strictEqual(value.paths['/pets'].get.deprecated, true);
        assert.strictEqual(value.paths['/pets'].get.summary, 'List pets');
        assert.strictEqual(value.paths['/users'].get.deprecated, true);
        assert.strictEqual(value.paths['/users'].get.summary, 'List users');
      });
    });

    context('given type mismatch between target and update', function () {
      specify('should throw when updating object with primitive', function () {
        const action = refractAction({
          target: '$.info',
          update: 'not an object',
        });
        const target = refract({ info: { title: 'API' } });

        assert.throws(() => applyAction(action, target), OverlayError, /[Ii]ncompatible/);
      });

      specify('should throw when updating primitive with object', function () {
        const action = refractAction({
          target: '$.info.title',
          update: { nested: 'value' },
        });
        const target = refract({ info: { title: 'API' } });

        assert.throws(() => applyAction(action, target), OverlayError, /[Ii]ncompatible/);
      });
    });

    context('given bracket notation for paths with special characters', function () {
      specify('should handle paths with slashes', function () {
        const action = refractAction({
          target: "$.paths['/pets'].get.summary",
          update: 'List all pets',
        });
        const target = refract({
          paths: { '/pets': { get: { summary: 'Pets' } } },
        });

        const result = applyAction(action, target);
        const value = toValue(result) as AnyJson;

        assert.strictEqual(value.paths['/pets'].get.summary, 'List all pets');
      });
    });
  });

  context('copy action', function () {
    specify('should copy primitive value from source to target', function () {
      const action = refractAction({
        target: "$.paths['/users'].get.description",
        copy: "$.paths['/pets'].get.description",
      });
      const target = refract({
        paths: {
          '/pets': { get: { description: 'List all pets' } },
          '/users': { get: { description: 'Old description' } },
        },
      });

      const result = applyAction(action, target);
      const value = toValue(result) as AnyJson;

      assert.strictEqual(value.paths['/users'].get.description, 'List all pets');
    });

    specify('should copy and merge object from source to target', function () {
      const action = refractAction({
        target: "$.paths['/users'].get",
        copy: "$.paths['/pets'].get",
      });
      const target = refract({
        paths: {
          '/pets': { get: { summary: 'List pets', description: 'Returns pets' } },
          '/users': { get: { summary: 'List users' } },
        },
      });

      const result = applyAction(action, target);
      const value = toValue(result) as AnyJson;

      // merged — copy source overwrites summary, adds description
      assert.strictEqual(value.paths['/users'].get.summary, 'List pets');
      assert.strictEqual(value.paths['/users'].get.description, 'Returns pets');
    });

    specify('should copy to multiple targets', function () {
      const action = refractAction({
        target: '$.paths[*].get.description',
        copy: '$.defaultDescription',
      });
      const target = refract({
        defaultDescription: 'Standard endpoint',
        paths: {
          '/a': { get: { description: 'old a' } },
          '/b': { get: { description: 'old b' } },
        },
      });

      const result = applyAction(action, target);
      const value = toValue(result) as AnyJson;

      assert.strictEqual(value.paths['/a'].get.description, 'Standard endpoint');
      assert.strictEqual(value.paths['/b'].get.description, 'Standard endpoint');
    });

    specify('should throw when copy source selects zero nodes', function () {
      const action = refractAction({
        target: '$.info.title',
        copy: '$.nonexistent',
      });
      const target = refract({ info: { title: 'API' } });

      assert.throws(() => applyAction(action, target), OverlayError, /zero nodes/);
    });

    specify('should throw when copy source selects multiple nodes', function () {
      const action = refractAction({
        target: '$.info.title',
        copy: '$.paths[*].get.summary',
      });
      const target = refract({
        info: { title: 'API' },
        paths: {
          '/a': { get: { summary: 'A' } },
          '/b': { get: { summary: 'B' } },
        },
      });

      assert.throws(() => applyAction(action, target), OverlayError, /single node/);
    });

    [true, false].forEach(function (immutable) {
      specify(`should copy the pristine source with immutable=${immutable}`, function () {
        const action = refractAction({
          target: "$.paths['/a'][*]",
          copy: "$.paths['/a']",
        });
        const target = refract({
          paths: { '/a': { get: { s: 'g' }, post: { s: 'p' } } },
        });

        const result = applyAction(action, target, { immutable });
        const value = toValue(result) as AnyJson;

        // '/a'.get is updated before '/a'.post, and the source sits above both
        assert.deepEqual(value.paths['/a'].post.get, { s: 'g' });
      });
    });
  });

  context('remove action', function () {
    specify('should remove a property from an object', function () {
      const action = refractAction({
        target: '$.info.description',
        remove: true,
      });
      const target = refract({
        info: { title: 'API', description: 'To remove', version: '1.0.0' },
      });

      const result = applyAction(action, target);
      const value = toValue(result) as AnyJson;

      assert.strictEqual(value.info.title, 'API');
      assert.strictEqual(value.info.version, '1.0.0');
      assert.isUndefined(value.info.description);
    });

    specify('should remove an entire object', function () {
      const action = refractAction({
        target: "$.paths['/old']",
        remove: true,
      });
      const target = refract({
        paths: {
          '/old': { get: { summary: 'Old endpoint' } },
          '/new': { get: { summary: 'New endpoint' } },
        },
      });

      const result = applyAction(action, target);
      const value = toValue(result) as AnyJson;

      assert.isUndefined(value.paths['/old']);
      assert.isDefined(value.paths['/new']);
    });

    specify('should remove an element from an array', function () {
      const action = refractAction({
        target: '$.servers[0]',
        remove: true,
      });
      const target = refract({
        servers: [
          { url: 'https://first.example.com' },
          { url: 'https://second.example.com' },
          { url: 'https://third.example.com' },
        ],
      });

      const result = applyAction(action, target);
      const value = toValue(result) as AnyJson;

      assert.strictEqual(value.servers.length, 2);
      assert.strictEqual(value.servers[0].url, 'https://second.example.com');
      assert.strictEqual(value.servers[1].url, 'https://third.example.com');
    });

    specify('should remove multiple matched nodes', function () {
      const action = refractAction({
        target: '$.paths[*].get.deprecated',
        remove: true,
      });
      const target = refract({
        paths: {
          '/a': { get: { summary: 'A', deprecated: true } },
          '/b': { get: { summary: 'B', deprecated: true } },
        },
      });

      const result = applyAction(action, target);
      const value = toValue(result) as AnyJson;

      assert.isUndefined(value.paths['/a'].get.deprecated);
      assert.isUndefined(value.paths['/b'].get.deprecated);
      assert.strictEqual(value.paths['/a'].get.summary, 'A');
      assert.strictEqual(value.paths['/b'].get.summary, 'B');
    });

    specify('should not mutate original target', function () {
      const action = refractAction({
        target: '$.info.description',
        remove: true,
      });
      const target = refract({
        info: { title: 'API', description: 'Keep me' },
      });

      applyAction(action, target);
      const value = toValue(target) as AnyJson;

      assert.strictEqual(value.info.description, 'Keep me');
    });

    specify('should handle remove: false as no-op', function () {
      const action = refractAction({
        target: '$.info.description',
        remove: false,
      });
      const target = refract({
        info: { title: 'API', description: 'Still here' },
      });

      const result = applyAction(action, target);
      const value = toValue(result) as AnyJson;

      assert.strictEqual(value.info.description, 'Still here');
    });
  });

  context('zero-match target', function () {
    specify('should succeed without changes', function () {
      const action = refractAction({
        target: '$.nonexistent.path',
        update: 'anything',
      });
      const target = refract({ info: { title: 'API' } });

      const result = applyAction(action, target);

      // spec: action succeeds without changing the target
      assert.deepEqual(toValue(result), toValue(target));

      // immutable contract: the caller never gets its own document back
      assert.notStrictEqual(result, target);
      (result as ObjectElement).set('added', 'value');
      ((result as ObjectElement).get('info') as ObjectElement).set('title', 'Mutated');
      assert.isUndefined((toValue(target) as AnyJson).added);
      assert.strictEqual((toValue(target) as AnyJson).info.title, 'API');
    });

    specify('should return the target itself in mutable mode', function () {
      const action = refractAction({
        target: '$.nonexistent.path',
        update: 'anything',
      });
      const target = refract({ info: { title: 'API' } });

      assert.strictEqual(applyAction(action, target, { immutable: false }), target);
    });

    specify('should throw in strict mode', function () {
      const action = refractAction({
        target: '$.nonexistent.path',
        update: 'anything',
      });
      const target = refract({ info: { title: 'API' } });

      assert.throws(
        () => applyAction(action, target, { strict: true }),
        OverlayError,
        /zero nodes.*strict/i,
      );
    });
  });

  context('action without update, copy or remove', function () {
    specify('should return an independent clone', function () {
      const action = refractAction({ target: '$.info' });
      const target = refract({ info: { title: 'API' } });

      const result = applyAction(action, target);

      assert.deepEqual(toValue(result), toValue(target));
      assert.notStrictEqual(result, target);
      (result as ObjectElement).set('added', 'value');
      ((result as ObjectElement).get('info') as ObjectElement).set('title', 'Mutated');
      assert.isUndefined((toValue(target) as AnyJson).added);
      assert.strictEqual((toValue(target) as AnyJson).info.title, 'API');
    });

    specify('should return the target itself in mutable mode', function () {
      const action = refractAction({ target: '$.info' });
      const target = refract({ info: { title: 'API' } });

      assert.strictEqual(applyAction(action, target, { immutable: false }), target);
    });
  });

  context('immutable mode (default)', function () {
    specify('should not mutate original target on update', function () {
      const action = refractAction({
        target: '$.info',
        update: { description: 'Added' },
      });
      const target = refract({ info: { title: 'Original' } });

      applyAction(action, target);
      const value = toValue(target) as AnyJson;

      assert.isUndefined(value.info.description);
    });

    specify('should not mutate original target on remove', function () {
      const action = refractAction({
        target: '$.info.description',
        remove: true,
      });
      const target = refract({ info: { title: 'API', description: 'Keep' } });

      applyAction(action, target);
      const value = toValue(target) as AnyJson;

      assert.strictEqual(value.info.description, 'Keep');
    });

    specify('should not mutate original target on root update', function () {
      const action = refractAction({
        target: '$',
        update: { openapi: '3.1.0' },
      });
      const target = refract({ info: { title: 'API' } });

      const result = applyAction(action, target);

      // the root is transplanted in place on the clone, never on the input
      assert.notStrictEqual(result, target);
      assert.isUndefined((toValue(target) as AnyJson).openapi);
      assert.strictEqual((toValue(result) as AnyJson).openapi, '3.1.0');
    });
  });

  context('partial options object', function () {
    specify('should keep the immutable default when other options are passed', function () {
      const action = refractAction({
        target: '$.info',
        update: { description: 'Added' },
      });
      const target = refract({ info: { title: 'Original' } });

      const result = applyAction(action, target, { strict: true });

      assert.strictEqual((toValue(result) as AnyJson).info.description, 'Added');
      assert.isUndefined((toValue(target) as AnyJson).info.description);
    });

    specify('should keep the immutable default when immutable is undefined', function () {
      const action = refractAction({
        target: '$.info',
        update: { description: 'Added' },
      });
      const target = refract({ info: { title: 'Original' } });

      applyAction(action, target, { immutable: undefined });

      assert.isUndefined((toValue(target) as AnyJson).info.description);
    });
  });

  context('mutable mode', function () {
    specify('should mutate original target on update', function () {
      const action = refractAction({
        target: '$.info',
        update: { description: 'Added' },
      });
      const target = refract({ info: { title: 'Original' } });

      applyAction(action, target, { immutable: false });
      const value = toValue(target) as AnyJson;

      assert.strictEqual(value.info.description, 'Added');
    });

    specify('should mutate original target on remove', function () {
      const action = refractAction({
        target: '$.info.description',
        remove: true,
      });
      const target = refract({ info: { title: 'API', description: 'Remove me' } });

      applyAction(action, target, { immutable: false });
      const value = toValue(target) as AnyJson;

      assert.isUndefined(value.info.description);
    });

    specify('should mutate original target on root update', function () {
      const action = refractAction({
        target: '$',
        update: { openapi: '3.1.0' },
      });
      const target = refract({ info: { title: 'API' } });

      const result = applyAction(action, target, { immutable: false });
      const value = toValue(target) as AnyJson;

      assert.strictEqual(result, target);
      assert.strictEqual(value.openapi, '3.1.0');
      assert.strictEqual(value.info.title, 'API');
    });

    specify('should mutate original array target on root update', function () {
      const action = refractAction({
        target: '$',
        update: ['b'],
      });
      const target = refract(['a']);

      const result = applyAction(action, target, { immutable: false });

      assert.strictEqual(result, target);
      assert.deepEqual(toValue(target), ['a', 'b']);
    });

    specify('should mutate original target on root copy', function () {
      const action = refractAction({
        target: '$',
        copy: '$.source',
      });
      const target = refract({ source: { added: 'value' } });

      const result = applyAction(action, target, { immutable: false });
      const value = toValue(target) as AnyJson;

      assert.strictEqual(result, target);
      assert.strictEqual(value.added, 'value');
    });

    specify('should mutate original target on same-typed root replacement', function () {
      const action = refractAction({
        target: '$',
        update: 'replaced',
      });
      const target = refract('original');

      const result = applyAction(action, target, { immutable: false });

      assert.strictEqual(result, target);
      assert.strictEqual(toValue(target), 'replaced');
    });

    specify('should preserve root element identity metadata on update', function () {
      const action = refractAction({
        target: '$',
        update: { openapi: '3.1.0' },
      });
      const target = refract({ info: { title: 'API' } });
      target.element = 'customName';
      target.meta.set('note', 'keep me');

      applyAction(action, target, { immutable: false });

      // transplanting content leaves the target's own identity untouched
      assert.strictEqual(target.element, 'customName');
      assert.strictEqual(toValue(target.meta.get('note')), 'keep me');
      assert.strictEqual((toValue(target) as AnyJson).openapi, '3.1.0');
    });

    specify('should clear stale meta on same-typed root replacement', function () {
      const action = refractAction({
        target: '$',
        update: 'replaced',
      });
      const target = refract('original');
      target.meta.set('note', 'stale');

      applyAction(action, target, { immutable: false });

      // a replacement carries the update value's meta, not the target's
      assert.isUndefined(toValue(target.meta.get('note')));
      assert.strictEqual(toValue(target), 'replaced');
    });

    specify('should rebind rather than throw on a frozen root', function () {
      const action = refractAction({
        target: '$',
        update: { openapi: '3.1.0' },
      });
      const target = refract({ info: { title: 'API' } });
      target.freeze();

      const result = applyAction(action, target, { immutable: false });

      // a frozen element rejects property assignment, so the transplant is skipped
      assert.notStrictEqual(result, target);
      assert.strictEqual((toValue(result) as AnyJson).openapi, '3.1.0');
      assert.isUndefined((toValue(target) as AnyJson).openapi);
    });

    specify('should rebind on differently typed root replacement', function () {
      const action = refractAction({
        target: '$',
        update: 42,
      });
      const target = refract('original');

      const result = applyAction(action, target, { immutable: false });

      // a primitive root replaced by another element class cannot be
      // transplanted in place — the return value is the only carrier
      assert.notStrictEqual(result, target);
      assert.strictEqual(toValue(result), 42);
      assert.strictEqual(toValue(target), 'original');
    });
  });

  context('element identity', function () {
    const schemasOf = (element: Element): ObjectElement =>
      ((element as ObjectElement).get('components') as ObjectElement).get(
        'schemas',
      ) as ObjectElement;

    [true, false].forEach(function (immutable) {
      context(`given immutable=${immutable}`, function () {
        specify('should not share update elements between matched targets', function () {
          const action = refractAction({
            target: "$.components.schemas['A', 'B']",
            update: { description: 'shared?', nested: { key: 'value' } },
          });
          const target = refract({
            components: { schemas: { A: { type: 'string' }, B: { type: 'string' } } },
          });

          const result = applyAction(action, target, { immutable });
          const schemas = schemasOf(result);
          const a = schemas.get('A') as ObjectElement;
          const b = schemas.get('B') as ObjectElement;

          assert.notStrictEqual(a.getMember('description')!.key, b.getMember('description')!.key);
          assert.notStrictEqual(
            a.getMember('description')!.value,
            b.getMember('description')!.value,
          );

          const aNested = a.get('nested') as ObjectElement;
          const bNested = b.get('nested') as ObjectElement;

          assert.notStrictEqual(aNested, bNested);
          assert.notStrictEqual(aNested.getMember('key')!.key, bNested.getMember('key')!.key);
          assert.notStrictEqual(aNested.getMember('key')!.value, bNested.getMember('key')!.value);
        });

        specify('should not share update elements with the overlay document', function () {
          const action = refractAction({
            target: '$.components.schemas.A',
            update: { description: 'shared?' },
          });
          const target = refract({ components: { schemas: { A: { type: 'string' } } } });
          const update = action.update as ObjectElement;

          const result = applyAction(action, target, { immutable });
          const a = schemasOf(result).get('A') as ObjectElement;

          assert.notStrictEqual(
            a.getMember('description')!.key,
            update.getMember('description')!.key,
          );
          assert.notStrictEqual(
            a.getMember('description')!.value,
            update.getMember('description')!.value,
          );
        });

        specify('should not share copied elements between matched targets and source', function () {
          const action = refractAction({
            target: "$.components.schemas['A', 'B']",
            copy: "$.components.schemas['SourceOne']",
          });
          const target = refract({
            components: {
              schemas: {
                A: { type: 'string' },
                B: { type: 'string' },
                SourceOne: { title: 'source title' },
              },
            },
          });

          const result = applyAction(action, target, { immutable });
          const schemas = schemasOf(result);
          const a = schemas.get('A') as ObjectElement;
          const b = schemas.get('B') as ObjectElement;
          const source = schemas.get('SourceOne') as ObjectElement;

          assert.notStrictEqual(a.getMember('title')!.key, b.getMember('title')!.key);
          assert.notStrictEqual(a.getMember('title')!.key, source.getMember('title')!.key);
          assert.notStrictEqual(b.getMember('title')!.value, source.getMember('title')!.value);
        });

        specify('should not share update elements between matched array items', function () {
          const action = refractAction({
            target: '$.list[*]',
            update: { description: 'shared?' },
          });
          const target = refract({ list: [{ type: 'string' }, { type: 'string' }] });

          const result = applyAction(action, target, { immutable });
          const list = (result as ObjectElement).get('list') as ArrayElement;
          const first = list.get(0) as ObjectElement;
          const second = list.get(1) as ObjectElement;

          assert.notStrictEqual(
            first.getMember('description')!.key,
            second.getMember('description')!.key,
          );
          assert.notStrictEqual(
            first.getMember('description')!.value,
            second.getMember('description')!.value,
          );
        });

        specify('should isolate mutations of a copied property', function () {
          const action = refractAction({
            target: "$.components.schemas['A', 'B']",
            copy: "$.components.schemas['SourceOne']",
          });
          const target = refract({
            components: {
              schemas: {
                A: { type: 'string' },
                B: { type: 'string' },
                SourceOne: { title: 'source title' },
              },
            },
          });

          const result = applyAction(action, target, { immutable });
          const schemas = schemasOf(result);
          const aTitle = (schemas.get('A') as ObjectElement).get('title')!;
          aTitle.content = 'mutated';
          const value = toValue(result) as AnyJson;

          assert.strictEqual(value.components.schemas.A.title, 'mutated');
          assert.strictEqual(value.components.schemas.B.title, 'source title');
          assert.strictEqual(value.components.schemas.SourceOne.title, 'source title');
        });
      });
    });

    specify('should not alias the input document in immutable mode', function () {
      const action = refractAction({
        target: '$.components.schemas.A',
        copy: '$.components.schemas.SourceOne',
      });
      const target = refract({
        components: {
          schemas: { A: { type: 'string' }, SourceOne: { title: 'source title' } },
        },
      });

      const result = applyAction(action, target, { immutable: true });
      const aTitle = (schemasOf(result).get('A') as ObjectElement).get('title')!;
      aTitle.content = 'mutated';

      const value = toValue(target) as AnyJson;

      assert.strictEqual(value.components.schemas.SourceOne.title, 'source title');
      assert.isUndefined(value.components.schemas.A.title);
    });
  });
});

describe('applyOverlayApiDOM', function () {
  context('sequential action ordering', function () {
    specify('should apply actions in order — last write wins', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [
          { target: '$.info.title', update: 'First' },
          { target: '$.info.title', update: 'Second' },
          { target: '$.info.title', update: 'Third' },
        ],
      });
      const target = refract({ info: { title: 'Original' } });

      const result = applyOverlayApiDOM(overlay, target);
      const value = toValue(result) as AnyJson;

      assert.strictEqual(value.info.title, 'Third');
    });

    specify('should allow remove followed by recreate', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [
          { target: '$.info.description', remove: true },
          { target: '$.info', update: { description: 'Recreated' } },
        ],
      });
      const target = refract({
        info: { title: 'API', description: 'Original description' },
      });

      const result = applyOverlayApiDOM(overlay, target);
      const value = toValue(result) as AnyJson;

      assert.strictEqual(value.info.description, 'Recreated');
    });

    specify('should allow copy followed by remove (move pattern)', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [
          { target: '$.destination', copy: '$.source' },
          { target: '$.source', remove: true },
        ],
      });
      const target = refract({
        source: 'value to move',
        destination: 'will be overwritten',
        other: 'stays',
      });

      const result = applyOverlayApiDOM(overlay, target);
      const value = toValue(result) as AnyJson;

      assert.strictEqual(value.destination, 'value to move');
      assert.isUndefined(value.source);
      assert.strictEqual(value.other, 'stays');
    });
  });

  context('partial options object', function () {
    specify('should keep the immutable default when other options are passed', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$.info', update: { description: 'Added' } }],
      });
      const target = refract({ info: { title: 'Original' } });

      const result = applyOverlayApiDOM(overlay, target, { strict: true });

      assert.strictEqual((toValue(result) as AnyJson).info.description, 'Added');
      assert.isUndefined((toValue(target) as AnyJson).info.description);
    });
  });

  context('empty actions', function () {
    specify('should return target unchanged', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [],
      });
      const target = refract({ info: { title: 'Unchanged' } });

      const result = applyOverlayApiDOM(overlay, target);
      const value = toValue(result) as AnyJson;

      assert.strictEqual(value.info.title, 'Unchanged');
      assert.notStrictEqual(result, target);
    });
  });

  context('missing actions field', function () {
    specify('should return an independent clone', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
      });
      const target = refract({ info: { title: 'Unchanged' } });

      const result = applyOverlayApiDOM(overlay, target);

      assert.deepEqual(toValue(result), toValue(target));
      assert.notStrictEqual(result, target);
      (result as ObjectElement).set('added', 'value');
      ((result as ObjectElement).get('info') as ObjectElement).set('title', 'Mutated');
      assert.isUndefined((toValue(target) as AnyJson).added);
      assert.strictEqual((toValue(target) as AnyJson).info.title, 'Unchanged');
    });

    specify('should return the target itself in mutable mode', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
      });
      const target = refract({ info: { title: 'Unchanged' } });

      assert.strictEqual(applyOverlayApiDOM(overlay, target, { immutable: false }), target);
    });
  });

  context('realistic overlay scenario', function () {
    specify('should produce correct result', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Documentation overlay', version: '1.0.0' },
        actions: [
          {
            target: '$.info',
            update: {
              description: 'A comprehensive pet management API',
              contact: { email: 'support@example.com' },
            },
          },
          {
            target: '$.info.title',
            update: 'Pet Management API',
          },
          {
            target: '$.tags',
            update: [{ name: 'admin', description: 'Admin operations' }],
          },
          {
            target: "$.paths['/legacy']",
            remove: true,
          },
        ],
      });
      const target = refract({
        openapi: '3.1.0',
        info: { title: 'Pet Store', version: '2.0.0' },
        paths: {
          '/pets': { get: { summary: 'List pets' } },
          '/legacy': { get: { summary: 'Old endpoint' } },
        },
        tags: [{ name: 'pets', description: 'Pet operations' }],
      });

      const result = applyOverlayApiDOM(overlay, target);

      expect(toJSON(result, undefined, 2)).toMatchSnapshot();
    });
  });

  context('non-overlay element', function () {
    specify('should throw OverlayError', function () {
      const notOverlay = refract({ not: 'an overlay' });
      const target = refract({ info: { title: 'API' } });

      assert.throws(
        () => applyOverlayApiDOM(notOverlay as unknown as Overlay1Element, target),
        OverlayError,
      );
    });
  });

  context('generic ParseResultElement target (no api class)', function () {
    specify('should apply overlay to generic JSON/YAML target', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$.title', update: 'Updated' }],
      });

      const targetContent = refract({ title: 'Original', version: '1.0.0' });
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult);
      const value = toValue(result.result) as AnyJson;

      assert.strictEqual(value.title, 'Updated');
      assert.strictEqual(value.version, '1.0.0');
    });

    specify('should return a new parse result even when nothing is applied', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$.nonexistent', update: 'anything' }],
      });

      const targetContent = refract({ title: 'Original' });
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult);

      // neither the parse result wrapper nor its result element is the caller's
      assert.notStrictEqual(result, targetParseResult);
      assert.notStrictEqual(result.result, targetContent);
      assert.strictEqual(targetParseResult.result, targetContent);
      assert.deepEqual(toValue(result.result), toValue(targetContent));
    });

    specify('should keep the result element when a primitive root is replaced', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$', update: 'replaced' }],
      });

      const targetContent = refract('original');
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult, { immutable: false });

      // the replacement carries the update value's meta, so the marker is restored
      assert.isDefined(result.result);
      assert.strictEqual(toValue(result.result), 'replaced');
      assert.deepEqual(toValue(result.result!.classes), ['result']);
    });

    specify('should keep the result element when a root changes primitive type', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$', update: 42 }],
      });

      const targetContent = refract('original');
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult, { immutable: false });

      assert.isDefined(result.result);
      assert.strictEqual(toValue(result.result), 42);
      assert.deepEqual(toValue(result.result!.classes), ['result']);
    });

    specify('should keep the result element on a primitive root in immutable mode', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$', update: 'replaced' }],
      });

      const targetContent = refract('original');
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult, { immutable: true });

      assert.isDefined(result.result);
      assert.strictEqual(toValue(result.result), 'replaced');
      assert.deepEqual(toValue(result.result!.classes), ['result']);
      // the caller's parse result keeps its own marked result element
      assert.strictEqual(targetParseResult.result, targetContent);
      assert.strictEqual(toValue(targetParseResult.result), 'original');
    });

    specify('should keep the result element across successive root actions', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [
          { target: '$', update: 'replaced' },
          { target: '$', update: 42 },
        ],
      });

      const targetContent = refract('original');
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult, { immutable: false });

      // the first action strips the marker off the element still in the wrapper,
      // so the slot must be found by identity rather than re-derived from it
      assert.isDefined(result.result);
      assert.strictEqual(toValue(result.result), 42);
      assert.strictEqual(result.length, 1);
      assert.deepEqual(toValue(result.result!.classes), ['result']);
    });

    specify('should not duplicate the result marker when it survives', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$', update: { openapi: '3.1.0' } }],
      });

      const targetContent = refract({ info: { title: 'API' } });
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult, { immutable: false });

      assert.deepEqual(toValue(result.result!.classes), ['result']);
    });

    specify('should keep the result element on an in-place root update', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [
          { target: '$', update: { openapi: '3.1.0' } },
          { target: '$.info', update: { version: '2.0.0' } },
        ],
      });

      const targetContent = refract({ info: { title: 'Original' } });
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult, { immutable: false });
      const value = toValue(result.result) as AnyJson;

      // the root action no longer detaches and re-attaches the result element
      assert.strictEqual(result, targetParseResult);
      assert.strictEqual(result.result, targetContent);
      assert.deepEqual(toValue(targetContent.classes), ['result']);
      assert.strictEqual(value.openapi, '3.1.0');
      assert.strictEqual(value.info.version, '2.0.0');
    });

    specify('should leave the target parse result untouched', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$.title', update: 'Updated' }],
      });

      const targetContent = refract({ title: 'Original' });
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult);

      assert.instanceOf(result, ParseResultElement);
      assert.notStrictEqual(result, targetParseResult);
      assert.strictEqual((toValue(result.result) as AnyJson).title, 'Updated');
      assert.strictEqual(targetParseResult.result, targetContent);
      assert.strictEqual((toValue(targetParseResult.result) as AnyJson).title, 'Original');
    });

    specify('should not touch the trace when the target has no result element', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$.title', update: 'Updated' }],
      });

      const trace = {} as OverlayTrace;

      assert.throws(
        () => applyOverlayApiDOM(overlay, new ParseResultElement(), { trace }),
        OverlayError,
      );
      assert.deepEqual(trace, {} as OverlayTrace);
    });

    specify('should keep the api class on the replaced result element', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$.title', update: 'Updated' }],
      });

      const targetContent = refract({ title: 'Original' });
      targetContent.classes.push('api');
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult);

      assert.strictEqual(result.api, result.result);
      assert.strictEqual((toValue(result.api) as AnyJson).title, 'Updated');
    });

    specify('should share the children the overlay cannot touch', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$.title', update: 'Updated' }],
      });

      const targetContent = refract({ title: 'Original' });
      targetContent.classes.push('result');
      const annotation = refract('parser warning');
      annotation.element = 'annotation';
      annotation.classes.push('warning');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);
      targetParseResult.push(annotation);

      const result = applyOverlayApiDOM(overlay, targetParseResult);

      assert.strictEqual(result.warnings.first, annotation);
    });

    specify('should update the target parse result in place when mutable', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$.title', update: 'Updated' }],
      });

      const targetContent = refract({ title: 'Original' });
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult, { immutable: false });

      assert.strictEqual(result, targetParseResult);
      assert.strictEqual(result.result, targetContent);
      assert.strictEqual((toValue(targetParseResult.result) as AnyJson).title, 'Updated');
    });

    specify('should return ParseResultElement when given ParseResultElement', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [{ target: '$.name', update: 'New Name' }],
      });

      const targetContent = refract({ name: 'Old Name' });
      targetContent.classes.push('result');
      const targetParseResult = new ParseResultElement();
      targetParseResult.push(targetContent);

      const result = applyOverlayApiDOM(overlay, targetParseResult);

      assert.instanceOf(result, ParseResultElement);
    });
  });
});
