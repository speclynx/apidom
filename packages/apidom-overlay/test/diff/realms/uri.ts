import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { isOverlay1Element } from '@speclynx/apidom-ns-overlay-1';

import diffOverlay from '../../../src/diff/realms/uri.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyJson = Record<string, any>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '..', '..', 'fixtures');
const fixturesStyleDir = path.join(__dirname, '..', '..', 'fixtures-style');

describe('diffOverlay (URI-level)', function () {
  context('given two JSON document URIs', function () {
    specify('should return an Overlay1Element', async function () {
      const leftURI = path.join(fixturesDir, 'update-primitive', 'target.json');
      const rightURI = path.join(fixturesDir, 'update-primitive', 'expected.json');

      const overlay = await diffOverlay(leftURI, rightURI);

      assert.isTrue(isOverlay1Element(overlay));
    });

    specify('should auto-populate extends with leftURI', async function () {
      const leftURI = path.join(fixturesDir, 'update-primitive', 'target.json');
      const rightURI = path.join(fixturesDir, 'update-primitive', 'expected.json');

      const overlay = await diffOverlay(leftURI, rightURI);
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(value.extends, leftURI);
    });

    specify('should use provided extends option', async function () {
      const leftURI = path.join(fixturesDir, 'update-primitive', 'target.json');
      const rightURI = path.join(fixturesDir, 'update-primitive', 'expected.json');
      const customExtends = 'https://example.com/openapi.json';

      const overlay = await diffOverlay(leftURI, rightURI, { extends: customExtends });
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(value.extends, customExtends);
    });

    specify('should use provided overlay version option', async function () {
      const leftURI = path.join(fixturesDir, 'update-primitive', 'target.json');
      const rightURI = path.join(fixturesDir, 'update-primitive', 'expected.json');

      const overlay = await diffOverlay(leftURI, rightURI, { overlay: '1.0.0' });
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(value.overlay, '1.0.0');
    });

    specify('should use provided info option', async function () {
      const leftURI = path.join(fixturesDir, 'update-primitive', 'target.json');
      const rightURI = path.join(fixturesDir, 'update-primitive', 'expected.json');

      const overlay = await diffOverlay(leftURI, rightURI, {
        info: { title: 'My migration', version: '1.0.0' },
      });
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(value.info.title, 'My migration');
      assert.strictEqual(value.info.version, '1.0.0');
    });

    specify('should produce correct actions for a remove-property diff', async function () {
      const leftURI = path.join(fixturesDir, 'remove-property', 'target.json');
      const rightURI = path.join(fixturesDir, 'remove-property', 'expected.json');

      const overlay = await diffOverlay(leftURI, rightURI);
      const value = toValue(overlay) as AnyJson;

      assert.strictEqual(overlay.actions?.length, 1);
      assert.strictEqual(value.actions[0].target, "$['info']['description']");
      assert.strictEqual(value.actions[0].remove, true);
    });
  });

  context('given two YAML document URIs', function () {
    specify('should parse YAML and return an Overlay1Element', async function () {
      const leftURI = path.join(fixturesStyleDir, 'yaml', 'target.yaml');
      const rightURI = path.join(fixturesStyleDir, 'yaml', 'target.yaml');

      const overlay = await diffOverlay(leftURI, rightURI);

      assert.isTrue(isOverlay1Element(overlay));
      assert.strictEqual(overlay.actions?.length, 0);
    });
  });

  context('given nonexistent file', function () {
    specify('should throw an error', async function () {
      const leftURI = '/nonexistent/target.json';
      const rightURI = path.join(fixturesDir, 'update-primitive', 'expected.json');

      try {
        await diffOverlay(leftURI, rightURI);
        assert.fail('Should have thrown');
      } catch (error) {
        assert.instanceOf(error, Error);
      }
    });
  });
});
