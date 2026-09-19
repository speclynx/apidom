import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { ParseResultElement } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-arazzo-1';
import { isOpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';

import { resolve, dereference } from '../../../../../src/index.ts';
import * as url from '../../../../../src/util/url.ts';
import FileResolver from '../../../../../src/resolve/resolvers/file/index-node.ts';

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

          specify('should read a document shared with source description once', async function () {
            const uri = path.join(rootFixturePath, 'root-shared.json');
            const fileResolver = new FileResolver({ fileAllowList: ['*'] });
            const reads: string[] = [];
            const read = fileResolver.read.bind(fileResolver);
            fileResolver.read = (file) => {
              reads.push(path.basename(file.uri));
              return read(file);
            };

            await resolve(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              resolve: { resolvers: [fileResolver] },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: true },
                },
              },
            });

            assert.deepEqual(reads.sort(), [
              'openapi-external.json',
              'pet.json',
              'root-shared.json',
            ]);
          });

          specify('should allow dereferencing from resolved refSet only', async function () {
            const uri = path.join(rootFixturePath, 'root.json');
            const options = {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: true },
                },
              },
            };
            const refSet = await resolve(uri, options);
            const dereferenceResult = await dereference(uri, {
              ...options,
              resolve: { resolvers: [] },
              dereference: { ...options.dereference, refSet },
            });

            const sdResult = dereferenceResult.get(1)! as ParseResultElement;

            assert.isTrue(isOpenApi3_1Element(sdResult.api));
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
