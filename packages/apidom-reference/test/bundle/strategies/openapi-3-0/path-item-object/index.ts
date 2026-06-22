import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-0';

import { bundle } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-3-0', function () {
      context('Path Item Object', function () {
        context('given multiple references to the same external Path Item', function () {
          const fixturePath = path.join(rootFixturePath, 'external-shared');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should inline each occurrence in place', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.isDefined(value.paths['/a'].get);
            assert.isDefined(value.paths['/b'].get);
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'shared.json');
          });
        });

        context('given an external Path Item referencing another Path Item', function () {
          const fixturePath = path.join(rootFixturePath, 'external-chain');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should follow the chain to the eventual Path Item', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.strictEqual(value.paths['/a'].get.operationId, 'realOperation');
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ex.json');
          });
        });

        context('given a circular external Path Item reference', function () {
          const fixturePath = path.join(rootFixturePath, 'external-circular');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should terminate and break the cycle', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.isDefined(value.paths['/a']);
          });
        });
      });
    });
  });
});
