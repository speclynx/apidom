import { assert } from 'chai';
import ApiDOMParser from '@speclynx/apidom-parser';

import * as overlayJsonAdapter from '../src/adapter.ts';

describe('given adapter is used in parser', function () {
  const parser = new ApiDOMParser().use(overlayJsonAdapter);

  context('given Overlay 1.0.0 definition in JSON format', function () {
    specify('should find appropriate media type', async function () {
      const mediaType = await parser.findMediaType('{"overlay": "1.0.0"}');

      assert.strictEqual(mediaType, 'application/vnd.oai.overlay+json;version=1.0.0');
    });
  });

  context('given Overlay 1.1.0 definition in JSON format', function () {
    specify('should find appropriate media type', async function () {
      const mediaType = await parser.findMediaType('{"overlay": "1.1.0"}');

      assert.strictEqual(mediaType, 'application/vnd.oai.overlay+json;version=1.1.0');
    });
  });

  context('given Overlay 1.0.A definition in JSON format', function () {
    specify('should not find appropriate media type', async function () {
      const mediaType = await parser.findMediaType('{"overlay": "1.0.A"}');

      assert.strictEqual(mediaType, 'application/octet-stream');
    });
  });

  context('given Overlay future definition in JSON format', function () {
    specify('should not find appropriate media type', async function () {
      const mediaType = await parser.findMediaType('{"overlay": "2.0.0"}');

      assert.strictEqual(mediaType, 'application/octet-stream');
    });
  });
});
