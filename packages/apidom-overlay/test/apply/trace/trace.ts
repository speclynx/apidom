import { assert } from 'chai';
import { refract } from '@speclynx/apidom-datamodel';
import { refractAction, refractOverlay1 } from '@speclynx/apidom-ns-overlay-1';

import { applyAction, applyOverlay } from '../../../src/apply/realms/apidom.ts';
import type { OverlayTrace } from '../../../src/apply/trace/types.ts';

describe('tracing', function () {
  context('applyAction', function () {
    specify('should not record trace when option is not provided', function () {
      const action = refractAction({ target: '$.info.title', update: 'New' });
      const target = refract({ info: { title: 'Old' } });

      // no trace option — should not throw
      applyAction(action, target);
    });

    specify('should record update action trace', function () {
      const trace = {} as OverlayTrace;
      const action = refractAction({ target: '$.info.title', update: 'New' });
      const target = refract({ info: { title: 'Old' } });

      applyAction(action, target, { trace });

      assert.lengthOf(trace.actions, 1);
      assert.strictEqual(trace.actions[0].target, '$.info.title');
      assert.strictEqual(trace.actions[0].type, 'update');
      assert.strictEqual(trace.actions[0].matchCount, 1);
      assert.lengthOf(trace.actions[0].normalizedPaths, 1);
      assert.isTrue(trace.actions[0].success);
      assert.isUndefined(trace.actions[0].error);
    });

    specify('should record remove action trace', function () {
      const trace = {} as OverlayTrace;
      const action = refractAction({ target: '$.info.description', remove: true });
      const target = refract({ info: { title: 'API', description: 'Remove me' } });

      applyAction(action, target, { trace });

      assert.lengthOf(trace.actions, 1);
      assert.strictEqual(trace.actions[0].type, 'remove');
      assert.isTrue(trace.actions[0].success);
    });

    specify('should record copy action trace', function () {
      const trace = {} as OverlayTrace;
      const action = refractAction({
        target: "$.paths['/users'].get.description",
        copy: "$.paths['/pets'].get.description",
      });
      const target = refract({
        paths: {
          '/pets': { get: { description: 'List all pets' } },
          '/users': { get: { description: 'Old' } },
        },
      });

      applyAction(action, target, { trace });

      assert.lengthOf(trace.actions, 1);
      assert.strictEqual(trace.actions[0].type, 'copy');
      assert.isTrue(trace.actions[0].success);
    });

    specify('should record noop for zero-match target', function () {
      const trace = {} as OverlayTrace;
      const action = refractAction({ target: '$.nonexistent', update: 'anything' });
      const target = refract({ info: { title: 'API' } });

      applyAction(action, target, { trace });

      assert.lengthOf(trace.actions, 1);
      assert.strictEqual(trace.actions[0].type, 'noop');
      assert.strictEqual(trace.actions[0].matchCount, 0);
      assert.deepEqual(trace.actions[0].normalizedPaths, []);
      assert.isTrue(trace.actions[0].success);
    });

    specify('should record noop for action without operation', function () {
      const trace = {} as OverlayTrace;
      const action = refractAction({ target: '$.info.title' });
      const target = refract({ info: { title: 'API' } });

      applyAction(action, target, { trace });

      assert.lengthOf(trace.actions, 1);
      assert.strictEqual(trace.actions[0].type, 'noop');
      assert.strictEqual(trace.actions[0].matchCount, 1);
      assert.isTrue(trace.actions[0].success);
    });

    specify('should record failed action in strict mode', function () {
      const trace = {} as OverlayTrace;
      const action = refractAction({ target: '$.nonexistent', update: 'anything' });
      const target = refract({ info: { title: 'API' } });

      try {
        applyAction(action, target, { strict: true, trace });
        assert.fail('Should have thrown');
      } catch {
        // expected
      }

      assert.lengthOf(trace.actions, 1);
      assert.isFalse(trace.actions[0].success);
      assert.isDefined(trace.actions[0].error);
      assert.isTrue(trace.failed);
      assert.strictEqual(trace.failedAt, 0);
      assert.match(trace.message, /zero nodes/i);
    });

    specify('should record failed action on type mismatch', function () {
      const trace = {} as OverlayTrace;
      const action = refractAction({ target: '$.info', update: 'not an object' });
      const target = refract({ info: { title: 'API' } });

      try {
        applyAction(action, target, { trace });
        assert.fail('Should have thrown');
      } catch {
        // expected
      }

      assert.lengthOf(trace.actions, 1);
      assert.isFalse(trace.actions[0].success);
      assert.isDefined(trace.actions[0].error);
      assert.isTrue(trace.failed);
    });

    specify('should record wildcard matches', function () {
      const trace = {} as OverlayTrace;
      const action = refractAction({ target: '$.paths[*].get.summary', update: 'Updated' });
      const target = refract({
        paths: {
          '/a': { get: { summary: 'A' } },
          '/b': { get: { summary: 'B' } },
        },
      });

      applyAction(action, target, { trace });

      assert.lengthOf(trace.actions, 1);
      assert.strictEqual(trace.actions[0].matchCount, 2);
      assert.lengthOf(trace.actions[0].normalizedPaths, 2);
    });
  });

  context('applyOverlay', function () {
    specify('should trace all actions in order', function () {
      const trace = {} as OverlayTrace;
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [
          { target: '$.info', update: { description: 'Added' } },
          { target: '$.info.title', update: 'Renamed' },
          { target: '$.info.version', remove: true },
        ],
      });
      const target = refract({
        info: { title: 'API', version: '1.0.0' },
      });

      applyOverlay(overlay, target, { trace });

      assert.lengthOf(trace.actions, 3);
      assert.strictEqual(trace.actions[0].type, 'update');
      assert.strictEqual(trace.actions[1].type, 'update');
      assert.strictEqual(trace.actions[2].type, 'remove');
      assert.isFalse(trace.failed);
      assert.strictEqual(trace.failedAt, -1);
      assert.strictEqual(trace.message, 'Overlay was successfully applied');
    });

    specify('should mark failed overlay with failedAt index', function () {
      const trace = {} as OverlayTrace;
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [
          { target: '$.info.title', update: 'OK' },
          { target: '$.info', update: 'not an object' },
        ],
      });
      const target = refract({ info: { title: 'API' } });

      try {
        applyOverlay(overlay, target, { trace });
        assert.fail('Should have thrown');
      } catch {
        // expected
      }

      assert.lengthOf(trace.actions, 2);
      assert.isTrue(trace.actions[0].success);
      assert.isFalse(trace.actions[1].success);
      assert.isTrue(trace.failed);
      assert.strictEqual(trace.failedAt, 1);
    });

    specify('should initialize trace even with empty actions', function () {
      const trace = {} as OverlayTrace;
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'Test', version: '1.0.0' },
        actions: [],
      });
      const target = refract({ info: { title: 'API' } });

      applyOverlay(overlay, target, { trace });

      assert.deepEqual(trace.actions, []);
      assert.isFalse(trace.failed);
      assert.strictEqual(trace.failedAt, -1);
    });
  });
});
