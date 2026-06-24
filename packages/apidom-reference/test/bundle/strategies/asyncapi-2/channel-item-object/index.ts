import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-asyncapi-2';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('asyncapi-2', function () {
      context('Channel Item Object', function () {
        context('given an external Channel Item reference', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-external');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should hoist the Channel Item into components.channels', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.property(
              toValue(evaluate(bundled.result as Element, '/components/channels')) as object,
              'externalChannel',
            );
          });

          specify('should rewrite the $ref to an internal pointer', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/channels/user~1signedup/$ref')),
              '#/components/channels/externalChannel',
            );
          });

          specify('should keep sibling fields on the referencing Channel Item', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/channels/user~1signedup/description')),
              'sibling stays on referencing element',
            );
          });

          specify(
            'should transitively hoist references inside the hoisted channel',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });

              assert.property(
                toValue(evaluate(bundled.result as Element, '/components/messages')) as object,
                'externalMessage',
              );
              assert.strictEqual(
                toValue(
                  evaluate(
                    bundled.result as Element,
                    '/components/channels/externalChannel/subscribe/message/$ref',
                  ),
                ),
                '#/components/messages/externalMessage',
              );
            },
          );

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ex.json');
          });
        });

        context('given a self-file Channel Item reference', function () {
          const fixturePath = path.join(rootFixturePath, 'self-file');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should normalize the $ref to a bare fragment', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/channels/user~1signedup/$ref')),
              '#/channels/user~1loggedin',
            );
          });
        });

        context('given circular external Channel Item references', function () {
          const fixturePath = path.join(rootFixturePath, 'circular');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should terminate and hoist both channels once', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.hasAllKeys(
              toValue(evaluate(bundled.result as Element, '/components/channels')) as object,
              ['channelA', 'channelB'],
            );
          });

          specify('should rewrite the cycle to internal pointers', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/channels/channelA/$ref')),
              '#/components/channels/channelB',
            );
            assert.strictEqual(
              toValue(evaluate(bundled.result as Element, '/components/channels/channelB/$ref')),
              '#/components/channels/channelA',
            );
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ex.json');
          });
        });
      });
    });
  });
});
