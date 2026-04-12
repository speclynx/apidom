import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, expect } from 'chai';
import { toJSON, toYAML } from '@speclynx/apidom-core';

import applyOverlay from '../src/apply-uri.ts';
import { OverlayError } from '../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures-style');

describe('applyOverlay (URI-level)', function () {
  context('given YAML target via extends', function () {
    specify('should preserve YAML formatting', async function () {
      const overlayURI = path.join(fixturesDir, 'yaml', 'overlay.yaml');
      const parseResult = await applyOverlay(overlayURI);
      const resultElement = parseResult.api!;
      const output = toYAML(resultElement, { preserveStyle: true });

      assert.include(output, 'Renamed API');
      assert.include(output, 'Added by overlay');
      assert.include(output, 'help@example.com');
      assert.notInclude(output, '{');
      assert.notInclude(output, '}');

      expect(output).toMatchSnapshot();
    });
  });

  context('given JSON target via extends', function () {
    specify('should preserve JSON formatting', async function () {
      const overlayURI = path.join(fixturesDir, 'json', 'overlay.json');
      const parseResult = await applyOverlay(overlayURI);
      const resultElement = parseResult.api!;
      const output = toJSON(resultElement, undefined, 2, { preserveStyle: true });

      const parsed = JSON.parse(output);
      assert.strictEqual(parsed.info.title, 'Renamed API');
      assert.strictEqual(parsed.info.description, 'Added by overlay');
      assert.strictEqual(parsed.info.contact.email, 'help@example.com');
      assert.include(output, '  "openapi"');

      expect(output).toMatchSnapshot();
    });
  });

  context('given explicit targetURI argument', function () {
    specify('should use targetURI instead of extends', async function () {
      const overlayURI = path.join(fixturesDir, 'no-extends', 'overlay.json');
      const targetURI = path.join(fixturesDir, 'json', 'target.json');
      const parseResult = await applyOverlay(overlayURI, targetURI);
      const resultElement = parseResult.api!;
      const output = toJSON(resultElement, undefined, 2, { preserveStyle: true });

      const parsed = JSON.parse(output);
      assert.strictEqual(parsed.info.title, 'Updated Title');
      assert.strictEqual(parsed.info.version, '1.0.0');
      assert.strictEqual(parsed.info.contact.email, 'help@example.com');
    });
  });

  context('given no targetURI and no extends', function () {
    specify('should throw OverlayError', async function () {
      const overlayURI = path.join(fixturesDir, 'no-extends', 'overlay.json');

      try {
        await applyOverlay(overlayURI);
        assert.fail('Should have thrown');
      } catch (error) {
        assert.instanceOf(error, OverlayError);
        assert.match((error as OverlayError).message, /no target/i);
      }
    });
  });

  context('given nonexistent overlay file', function () {
    specify('should throw error', async function () {
      try {
        await applyOverlay('/nonexistent/overlay.json');
        assert.fail('Should have thrown');
      } catch (error) {
        assert.instanceOf(error, Error);
      }
    });
  });
});
