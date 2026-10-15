import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import {
  mediaTypes,
  isActionElement,
  isReusableActionReferenceElement,
  Overlay1Element,
} from '@speclynx/apidom-ns-overlay-1';

import { dereference, parse, dereferenceApiDOM } from '../../../../../src/index.ts';
import UnresolvableReferenceError from '../../../../../src/errors/UnresolvableReferenceError.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');
const parseOptions = { mediaType: mediaTypes.latest('json') };

describe('dereference', function () {
  context('strategies', function () {
    context('overlay-1', function () {
      context('reusable actions', function () {
        context('given Reusable Action References', function () {
          specify('should replace them with resolved Action Objects', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const dereferenceResult = await dereference(uri, { parse: parseOptions });
            const { actions } = dereferenceResult.api as Overlay1Element;

            assert.isTrue([0, 1, 2].every((i) => isActionElement(actions!.get(i))));
            assert.deepEqual(toValue(actions), [
              { target: '$.info', update: { 'x-overlay-applied': true } },
              {
                target: '$.paths.*.get.responses',
                description: 'Adds an error response to GET operations',
                update: { '404': { description: 'Not Found' } },
              },
              { target: "$.paths['/internal']", remove: true },
            ]);
          });

          specify('should annotate resolved Action Objects', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const dereferenceResult = await dereference(uri, { parse: parseOptions });
            const actionElement = (dereferenceResult.api as Overlay1Element).actions!.get(1)!;

            assert.deepEqual(toValue(actionElement.meta.get('ref-fields')), {
              $ref: '#/components/actions/errorResponse',
              description: 'Adds an error response to GET operations',
            });
            assert.strictEqual(toValue(actionElement.meta.get('ref-origin')), uri);
            assert.strictEqual(
              toValue(actionElement.meta.get('ref-type')),
              'reusableActionReference',
            );
          });

          specify('should keep the source position of the reference', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const parseResult = await parse(uri, {
              parse: {
                ...parseOptions,
                parserOpts: { 'overlay-json-1': { sourceMap: true, strict: false } },
              },
            });
            const referenceElement = (parseResult.api as Overlay1Element).actions!.get(1)!;
            const dereferenced = await dereferenceApiDOM(parseResult, {
              parse: parseOptions,
              resolve: { baseURI: uri },
            });
            const actionElement = (dereferenced.api as Overlay1Element).actions!.get(1)!;

            assert.isTrue(isReusableActionReferenceElement(referenceElement));
            assert.isNumber(referenceElement.startLine);
            assert.strictEqual(actionElement.startLine, referenceElement.startLine);
            assert.strictEqual(actionElement.endOffset, referenceElement.endOffset);
          });

          specify('should not mutate the original parse result', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const parseResult = await parse(uri, { parse: parseOptions });
            await dereferenceApiDOM(parseResult, {
              parse: parseOptions,
              resolve: { baseURI: uri },
              dereference: { immutable: true },
            });
            const { actions } = parseResult.api as Overlay1Element;

            assert.isTrue(isReusableActionReferenceElement(actions!.get(1)));
          });
        });

        context('given resolve.internal disabled', function () {
          specify('should keep Reusable Action References', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const dereferenceResult = await dereference(uri, {
              parse: parseOptions,
              resolve: { internal: false },
            });
            const { actions } = dereferenceResult.api as Overlay1Element;

            assert.isTrue(isReusableActionReferenceElement(actions!.get(1)));
          });
        });

        context('given unresolvable Reusable Action Reference', function () {
          specify('should throw', async function () {
            const uri = path.join(rootFixturePath, 'overlay-unresolvable.json');

            try {
              await dereference(uri, { parse: parseOptions });
              assert.fail('should throw UnresolvableReferenceError');
            } catch (error: any) {
              assert.instanceOf(error, UnresolvableReferenceError);
              assert.propertyVal(error, 'refFieldValue', '#/components/actions/missing');
              assert.propertyVal(error, 'location', '/actions/0');
            }
          });

          specify('should report the error and keep the reference', async function () {
            const uri = path.join(rootFixturePath, 'overlay-unresolvable.json');
            const errors: Error[] = [];
            const dereferenceResult = await dereference(uri, {
              parse: parseOptions,
              dereference: { continueOnError: (error: Error) => errors.push(error) },
            });
            const { actions } = dereferenceResult.api as Overlay1Element;

            assert.lengthOf(errors, 1);
            assert.isTrue(isReusableActionReferenceElement(actions!.get(0)));
          });

          specify('should keep the reference silently with continueOnError', async function () {
            const uri = path.join(rootFixturePath, 'overlay-unresolvable.json');
            const dereferenceResult = await dereference(uri, {
              parse: parseOptions,
              dereference: { continueOnError: true },
            });
            const { actions } = dereferenceResult.api as Overlay1Element;

            assert.isTrue(isReusableActionReferenceElement(actions!.get(0)));
          });
        });
      });
    });
  });
});
