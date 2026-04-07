import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { mediaTypes } from '@speclynx/apidom-ns-overlay-1';

import { resolve } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('resolve', function () {
  context('strategies', function () {
    context('overlay-1', function () {
      context('extends', function () {
        context('given extends enabled', function () {
          specify('should resolve extends target document', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const refSet = await resolve(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            // overlay document + extends target document
            assert.strictEqual(refSet.size, 2);
          });
        });

        context('given extends disabled', function () {
          specify('should resolve only overlay document', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const refSet = await resolve(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            // only overlay document
            assert.strictEqual(refSet.size, 1);
          });
        });

        context('given overlay without extends field', function () {
          specify('should resolve only overlay document', async function () {
            const uri = path.join(rootFixturePath, 'overlay-no-extends.json');
            const refSet = await resolve(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            // only overlay document
            assert.strictEqual(refSet.size, 1);
          });
        });
      });
    });
  });
});
