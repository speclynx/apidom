import { assert } from 'chai';

import { merge as mergeOptions } from '../../src/options/util.ts';
import defaultOptions from '../../src/options/index.ts';
import { cwd, fromFileSystemPath } from '../../src/util/url.ts';

describe('options', function () {
  context('merge', function () {
    context('given empty baseURI', function () {
      specify('should default to the encoded working directory', function () {
        const options = mergeOptions(defaultOptions, { resolve: { baseURI: '' } });

        assert.strictEqual(options.resolve.baseURI, fromFileSystemPath(cwd()));
      });

      context('given browser page loaded from file:// URL', function () {
        specify('should keep the already encoded page URL', function () {
          const globals = globalThis as unknown as Record<string, unknown>;
          const processBrowser = (process as unknown as Record<string, unknown>).browser;
          (process as unknown as Record<string, unknown>).browser = true;
          globals.location = { href: 'file:///one%20two/page.html' };

          try {
            const options = mergeOptions(defaultOptions, { resolve: { baseURI: '' } });

            assert.strictEqual(options.resolve.baseURI, 'file:///one%20two/page.html');
          } finally {
            (process as unknown as Record<string, unknown>).browser = processBrowser;
            delete globals.location;
          }
        });
      });
    });
  });
});
