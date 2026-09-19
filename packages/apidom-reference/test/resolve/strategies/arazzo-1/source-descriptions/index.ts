import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { mediaTypes } from '@speclynx/apidom-ns-arazzo-1';

import { resolve } from '../../../../../src/index.ts';
import * as url from '../../../../../src/util/url.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('resolve', function () {
  context('strategies', function () {
    context('arazzo-1', function () {
      context('sourceDescriptions', function () {
        context('given sourceDescriptions enabled', function () {
          specify('should resolve source description documents', async function () {
            const uri = path.join(rootFixturePath, 'root.json');
            const refSet = await resolve(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: true },
                },
              },
            });

            // arazzo document + openapi source description
            assert.strictEqual(refSet.size, 2);
          });
        });

        context('given source description with external references', function () {
          specify('should resolve documents referenced by source description', async function () {
            const uri = path.join(rootFixturePath, 'root-external.json');
            const refSet = await resolve(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: true },
                },
              },
            });

            // arazzo document + openapi source description + schema referenced by it
            assert.strictEqual(refSet.size, 3);
            assert.isTrue(
              refSet.has(url.sanitize(path.join(rootFixturePath, 'schemas', 'pet.json'))),
            );
          });

          specify('should resolve source description that fails to dereference', async function () {
            const uri = path.join(rootFixturePath, 'root-unresolvable.json');
            const refSet = await resolve(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: true },
                },
              },
            });

            // arazzo document + openapi source description
            assert.strictEqual(refSet.size, 2);
            assert.isTrue(
              refSet.has(url.sanitize(path.join(rootFixturePath, 'openapi-unresolvable.json'))),
            );
          });
        });

        context('given sourceDescriptions disabled', function () {
          specify('should resolve only arazzo document', async function () {
            const uri = path.join(rootFixturePath, 'root.json');
            const refSet = await resolve(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            // only arazzo document
            assert.strictEqual(refSet.size, 1);
          });
        });

        context('given arazzo without source descriptions', function () {
          specify('should resolve only arazzo document', async function () {
            const uri = path.join(rootFixturePath, 'root-no-sources.json');
            const refSet = await resolve(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: true },
                },
              },
            });

            // only arazzo document
            assert.strictEqual(refSet.size, 1);
          });
        });
      });
    });
  });
});
