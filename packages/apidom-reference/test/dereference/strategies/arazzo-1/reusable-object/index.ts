import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { mediaTypes } from '@speclynx/apidom-ns-arazzo-1';

import { loadJsonFile } from '../../../../helpers.ts';
import { dereference } from '../../../../../src/index.ts';
import UnresolvableReferenceError from '../../../../../src/errors/UnresolvableReferenceError.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('dereference', function () {
  context('strategies', function () {
    context('arazzo-1', function () {
      context('Reusable Element', function () {
        context('given Reusable Elements in Step Object parameters', function () {
          const fixturePath = path.join(rootFixturePath, 'step-parameters');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reusable Elements with value override', function () {
          const fixturePath = path.join(rootFixturePath, 'parameter-value-override');

          specify('should override value field in Parameter Object', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reusable Elements in Step Object onSuccess', function () {
          const fixturePath = path.join(rootFixturePath, 'step-success-actions');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reusable Elements in Step Object onFailure', function () {
          const fixturePath = path.join(rootFixturePath, 'step-failure-actions');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reusable Elements in Workflow Object parameters', function () {
          const fixturePath = path.join(rootFixturePath, 'workflow-parameters');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reusable Elements in Workflow Object successActions', function () {
          const fixturePath = path.join(rootFixturePath, 'workflow-success-actions');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reusable Elements in Workflow Object failureActions', function () {
          const fixturePath = path.join(rootFixturePath, 'workflow-failure-actions');

          specify('should dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });

        context('given Reusable Elements referencing inputs', function () {
          const fixturePath = path.join(rootFixturePath, 'inputs-not-referenceable');

          specify('should throw UnresolvableReferenceError', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw UnresolvableReferenceError');
            } catch (error: unknown) {
              assert.instanceOf(error, UnresolvableReferenceError);
            }
          });
        });

        context('given Reusable Elements with unresolvable reference', function () {
          const fixturePath = path.join(rootFixturePath, 'unresolvable-reference');

          specify('should throw UnresolvableReferenceError', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw UnresolvableReferenceError');
            } catch (error: unknown) {
              assert.instanceOf(error, UnresolvableReferenceError);
            }
          });
        });

        context('given Reusable Elements with invalid runtime expression', function () {
          const fixturePath = path.join(rootFixturePath, 'invalid-runtime-expression');

          specify('should throw UnresolvableReferenceError', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');

            try {
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              assert.fail('should throw UnresolvableReferenceError');
            } catch (error: unknown) {
              assert.instanceOf(error, UnresolvableReferenceError);
            }
          });
        });

        context('given continueOnError option', function () {
          const rootFilePath = path.join(rootFixturePath, 'continue-on-error', 'root.json');
          const expectedParameters = [
            { reference: '$components.parameters.nonExistent' },
            { reference: '$inputs.limit' },
            { name: 'limit', in: 'query', value: 10 },
          ];

          specify('should skip unresolvable Reusable Elements', async function () {
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: { continueOnError: true },
            });
            const [{ workflows }] = toValue(actual) as any;

            assert.deepEqual(workflows[0].steps[0].parameters, expectedParameters);
          });

          specify('should call the callback with UnresolvableReferenceError', async function () {
            const errors: UnresolvableReferenceError[] = [];
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                continueOnError: (error: UnresolvableReferenceError) => errors.push(error),
              },
            });
            const [{ workflows }] = toValue(actual) as any;

            assert.deepEqual(workflows[0].steps[0].parameters, expectedParameters);
            assert.lengthOf(errors, 2);
            errors.forEach((error) => assert.instanceOf(error, UnresolvableReferenceError));
            assert.deepEqual(
              errors.map((error: any) => [error.refFieldName, error.refFieldValue]),
              [
                ['reference', '$components.parameters.nonExistent'],
                ['reference', '$inputs.limit'],
              ],
            );
          });
        });

        context('given resolve.internal is set to false', function () {
          const fixturePath = path.join(rootFixturePath, 'ignore-internal');

          specify('should not dereference', async function () {
            const rootFilePath = path.join(fixturePath, 'root.json');
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              resolve: { internal: false },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });
        });
      });
    });
  });
});
