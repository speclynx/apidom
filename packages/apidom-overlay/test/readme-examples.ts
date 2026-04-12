import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { refract } from '@speclynx/apidom-datamodel';
import { toValue, toYAML } from '@speclynx/apidom-core';
import { refractOverlay1, refractAction } from '@speclynx/apidom-ns-overlay-1';

import applyOverlay, {
  applyOverlayApiDOM,
  applyAction,
  validateAction,
  OverlayError,
} from '../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('README examples', function () {
  context('applying from file/URL', function () {
    specify('target from extends field', async function () {
      const result = await applyOverlay(
        path.join(__dirname, 'fixtures-style', 'yaml', 'overlay.yaml'),
      );

      assert.isDefined(result.api);
      const yaml = toYAML(result.api!, { preserveStyle: true });
      assert.include(yaml, 'Renamed API');
    });

    specify('explicit target', async function () {
      const result = await applyOverlay(
        path.join(__dirname, 'fixtures-style', 'no-extends', 'overlay.json'),
        path.join(__dirname, 'fixtures-style', 'json', 'target.json'),
      );

      assert.isDefined(result.api);
    });
  });

  context('applying to ApiDOM elements', function () {
    specify('applyOverlayApiDOM example', function () {
      const overlay = refractOverlay1({
        overlay: '1.1.0',
        info: { title: 'My overlay', version: '1.0.0' },
        actions: [
          { target: '$.info', update: { description: 'Added by overlay' } },
          { target: '$.info.title', update: 'Renamed API' },
        ],
      });
      const target = refract({
        openapi: '3.1.0',
        info: { title: 'Original', version: '1.0.0' },
      });

      const result = applyOverlayApiDOM(overlay, target);
      const value = toValue(result) as Record<string, any>;

      assert.strictEqual(value.info.title, 'Renamed API');
      assert.strictEqual(value.info.description, 'Added by overlay');
      assert.strictEqual(value.info.version, '1.0.0');
    });
  });

  context('applying a single action', function () {
    specify('applyAction example', function () {
      const action = refractAction({
        target: '$.info.title',
        update: 'New Title',
      });
      const target = refract({ info: { title: 'Old Title', version: '1.0.0' } });

      const result = applyAction(action, target);
      const value = toValue(result) as Record<string, any>;

      assert.strictEqual(value.info.title, 'New Title');
      assert.strictEqual(value.info.version, '1.0.0');
    });
  });

  context('validation', function () {
    specify('validateAction example — valid', function () {
      const action = refractAction({ target: '$.info', update: { title: 'New' } });
      const result = validateAction(action);

      assert.isTrue(result.valid);
    });

    specify('validateAction example — invalid', function () {
      const action = refractAction({ update: { title: 'New' } });
      const result = validateAction(action);

      assert.isFalse(result.valid);
      assert.isDefined(result.error);
      assert.isDefined(result.error!.message);
      assert.isDefined(result.error!.action);
    });
  });

  context('error handling', function () {
    specify('OverlayError with structured context', function () {
      const action = refractAction({
        target: '$.info',
        update: 'not an object',
      });
      const target = refract({ info: { title: 'API' } });

      try {
        applyAction(action, target);
        assert.fail('Should have thrown');
      } catch (error) {
        assert.instanceOf(error, OverlayError);
        assert.isDefined((error as OverlayError).message);
        assert.isDefined((error as OverlayError).action);
      }
    });
  });
});
