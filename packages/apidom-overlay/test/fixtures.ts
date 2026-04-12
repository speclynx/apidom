import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { refract } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { refractOverlay1 } from '@speclynx/apidom-ns-overlay-1';

import { applyOverlayApiDOM } from '../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

/**
 * Language-agnostic fixture-driven tests.
 *
 * Each subdirectory in test/fixtures/ contains:
 *   - overlay.json  — the overlay document
 *   - target.json   — the target document to apply the overlay to
 *
 * Success case (expected result):
 *   - expected.json — the expected result after applying the overlay
 *
 * Error case (expected failure):
 *   - error.json    — { "message": "substring" } to match against thrown error
 *
 * These fixtures can be used by any implementation in any language
 * to validate overlay application conformance.
 */

const hasFiles = (dir: string, ...files: string[]) =>
  files.every((f) => fs.existsSync(path.join(dir, f)));

describe('overlay application fixtures', function () {
  const allDirs = fs.readdirSync(fixturesDir).filter((entry) => {
    const dir = path.join(fixturesDir, entry);
    return fs.statSync(dir).isDirectory() && hasFiles(dir, 'overlay.json', 'target.json');
  });

  const successFixtures = allDirs.filter((entry) =>
    hasFiles(path.join(fixturesDir, entry), 'expected.json'),
  );
  const errorFixtures = allDirs.filter((entry) =>
    hasFiles(path.join(fixturesDir, entry), 'error.json'),
  );

  context('success cases', function () {
    for (const fixture of successFixtures) {
      specify(fixture, function () {
        const dir = path.join(fixturesDir, fixture);
        const overlay = JSON.parse(fs.readFileSync(path.join(dir, 'overlay.json'), 'utf-8'));
        const target = JSON.parse(fs.readFileSync(path.join(dir, 'target.json'), 'utf-8'));
        const expected = JSON.parse(fs.readFileSync(path.join(dir, 'expected.json'), 'utf-8'));

        const overlayElement = refractOverlay1(overlay);
        const targetElement = refract(target);
        const result = applyOverlayApiDOM(overlayElement, targetElement);

        assert.deepEqual(toValue(result), expected);
      });
    }
  });

  context('error cases', function () {
    for (const fixture of errorFixtures) {
      specify(fixture, function () {
        const dir = path.join(fixturesDir, fixture);
        const overlay = JSON.parse(fs.readFileSync(path.join(dir, 'overlay.json'), 'utf-8'));
        const target = JSON.parse(fs.readFileSync(path.join(dir, 'target.json'), 'utf-8'));
        const error = JSON.parse(fs.readFileSync(path.join(dir, 'error.json'), 'utf-8'));

        const overlayElement = refractOverlay1(overlay);
        const targetElement = refract(target);

        assert.throws(
          () => applyOverlayApiDOM(overlayElement, targetElement),
          Error,
          new RegExp(error.message, 'i'),
        );
      });
    }
  });
});
