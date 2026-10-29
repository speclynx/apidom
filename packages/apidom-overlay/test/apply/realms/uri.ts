import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, expect } from 'chai';
import { toJSON, toYAML, toValue } from '@speclynx/apidom-core';
import { url } from '@speclynx/apidom-reference';

import applyOverlay from '../../../src/apply/realms/uri.ts';
import OverlayError from '../../../src/errors/OverlayError.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '..', '..', 'fixtures-style');

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

  context('given YAML overlay adding values to YAML target', function () {
    specify('should write added values as written in the overlay', async function () {
      const overlayURI = path.join(fixturesDir, 'overlay-style', 'overlay.yaml');
      const parseResult = await applyOverlay(overlayURI);
      const output = toYAML(parseResult.api!, { preserveStyle: true });

      assert.include(output, "title: 'The user''s API'\n");
      assert.include(output, 'description: "Line one\\nLine two"\n');
      // https://github.com/speclynx/apidom/issues/681
      assert.include(
        output,
        'description: |-\n        Returns all pets\n        from the store\n      x-usage: |\n        Line one\n      operationId: listPets\n',
      );
    });
  });

  context('given YAML overlay merging into flow mapping of YAML target', function () {
    specify('should keep the flow mapping', async function () {
      const overlayURI = path.join(fixturesDir, 'merge-style', 'overlay.yaml');
      const parseResult = await applyOverlay(overlayURI);
      const output = toYAML(parseResult.api!, { preserveStyle: true });

      assert.include(output, 'info: {title: Pets, version: "1.0.0", summary: Pet store}\n');
    });
  });

  context('given JSON overlay adding values to JSON target', function () {
    specify('should write added values as written in the overlay', async function () {
      const overlayURI = path.join(fixturesDir, 'overlay-style', 'overlay.json');
      const parseResult = await applyOverlay(overlayURI);
      const output = toJSON(parseResult.api!, undefined, 2, { preserveStyle: true });

      assert.include(output, '"x-rate": 1.0');
    });
  });

  context('given JSON overlay adding values to YAML target', function () {
    specify('should write added values in default YAML style', async function () {
      const overlayURI = path.join(fixturesDir, 'overlay-style', 'overlay.json');
      const targetURI = path.join(fixturesDir, 'yaml', 'target.yaml');
      const parseResult = await applyOverlay(overlayURI, targetURI);
      const output = toYAML(parseResult.api!, { preserveStyle: true });

      assert.include(output, '  x-rate: 1\n');
    });
  });

  context('given YAML overlay adding values to JSON target', function () {
    specify('should write added values in default JSON style', async function () {
      const overlayURI = path.join(fixturesDir, 'overlay-style', 'overlay.yaml');
      const targetURI = path.join(fixturesDir, 'json', 'target.json');
      const parseResult = await applyOverlay(overlayURI, targetURI);
      const output = toJSON(parseResult.api!, undefined, 2, { preserveStyle: true });

      assert.include(output, '"title": "The user\'s API"');
      assert.include(output, '"description": "Returns all pets\\nfrom the store"');
    });
  });

  context('given YAML overlay with anchors, aliases and comments', function () {
    specify('should not write them to the target', async function () {
      const overlayURI = path.join(fixturesDir, 'overlay-style', 'overlay-anchors.yaml');
      const parseResult = await applyOverlay(overlayURI);
      const output = toYAML(parseResult.api!, { preserveStyle: true });

      assert.include(output, '  x-meta: foo\n');
      assert.include(output, '  x-alias: "*shared"\n');
      assert.include(output, '  x-note: hello\n');
      assert.include(output, 'x-common: &shared\n  a: 1\nx-ref: *shared\n');
      assert.notInclude(output, 'overlay-only note');
      assert.notInclude(output, 'internal note');
    });
  });

  context('given Overlay 1.2.0 document', function () {
    specify('should resolve extends against $self and apply reusable actions', async function () {
      const overlayURI = path.join(fixturesDir, 'overlay-1-2-0', 'overlays', 'overlay.yaml');
      const parseResult = await applyOverlay(overlayURI);

      assert.deepEqual(toValue(parseResult.api), {
        openapi: '3.1.0',
        info: { title: 'Pets', version: '1.0.0' },
        paths: {
          '/pets': {
            get: {
              responses: {
                '200': { description: 'OK' },
                '404': { description: 'Not Found' },
              },
            },
          },
        },
      });
    });
  });

  context('given Overlay 1.2.0 document with unresolvable reference', function () {
    specify('should report the normalized overlay URI', async function () {
      const overlayURI = path.join(
        fixturesDir,
        'overlay-1-2-0',
        'overlays',
        'overlay unresolvable.yaml',
      );

      try {
        await applyOverlay(overlayURI);
        assert.fail('Should have thrown');
      } catch (error: unknown) {
        assert.instanceOf(error, OverlayError);
        const { uri } = (error as OverlayError).cause as { uri: string };
        assert.strictEqual(uri, url.sanitize(overlayURI));
        assert.include(uri, 'overlay%20unresolvable.yaml');
      }
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
