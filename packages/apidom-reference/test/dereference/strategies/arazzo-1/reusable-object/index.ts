import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { includesClasses, isParseResultElement } from '@speclynx/apidom-datamodel';
import {
  isParameterElement,
  isReusableElement,
  isSuccessActionElement,
  mediaTypes,
} from '@speclynx/apidom-ns-arazzo-1';

import { loadJsonFile } from '../../../../helpers.ts';
import { dereferenceWorkflow } from '../helpers.ts';
import { dereference, dereferenceApiDOM, parse, ReferenceSet } from '../../../../../src/index.ts';
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
            { reference: 'invalid-expression' },
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
            assert.lengthOf(errors, 3);
            errors.forEach((error) => assert.instanceOf(error, UnresolvableReferenceError));
            assert.deepEqual(
              errors.map((error: any) => [error.refFieldName, error.refFieldValue]),
              [
                ['reference', '$components.parameters.nonExistent'],
                ['reference', '$inputs.limit'],
                ['reference', 'invalid-expression'],
              ],
            );
          });
        });

        context('given Reusable Elements nested in referenced components', function () {
          const fixturePath = path.join(rootFixturePath, 'nested-reusable');
          const rootFilePath = path.join(fixturePath, 'root.json');
          const assertNestedParameters = (workflow: any) => {
            const actions = [
              workflow.steps.get(0).onSuccess.get(0),
              workflow.steps.get(0).onFailure.get(0),
              workflow.successActions.get(0),
              workflow.failureActions.get(0),
            ];
            const values = ['from-success-action', 'from-failure-action'];

            actions.forEach((action: any, index: number) => {
              const parameter = action.parameters.get(0);

              assert.isTrue(isParameterElement(parameter));
              assert.deepEqual(toValue(parameter), {
                name: 'status',
                in: 'query',
                value: values[index % 2],
              });
              assert.deepEqual(toValue(parameter.meta.get('ref-fields')), {
                reference: '$components.parameters.status',
                value: values[index % 2],
              });
              assert.strictEqual(toValue(parameter.meta.get('ref-origin')), rootFilePath);
              assert.strictEqual(toValue(parameter.meta.get('ref-type')), 'reusable');
            });
          };

          specify('should dereference', async function () {
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });

          specify('should dereference when dereferencing a Workflow fragment', async function () {
            assertNestedParameters(await dereferenceWorkflow(rootFilePath, 1));
          });

          specify(
            'should dereference when dereferencing a Workflow fragment with immutable=false',
            async function () {
              assertNestedParameters(
                await dereferenceWorkflow(rootFilePath, 1, { dereference: { immutable: false } }),
              );
            },
          );

          specify('should not dereference when resolve.internal=false', async function () {
            const workflow = await dereferenceWorkflow(rootFilePath, 1, {
              resolve: { internal: false },
            });

            assert.deepEqual(toValue(workflow.steps.get(0).onSuccess), [
              { reference: '$components.successActions.jump' },
            ]);
          });
        });

        context('given Reusable Elements referencing components of another type', function () {
          const rootFilePath = path.join(rootFixturePath, 'type-mismatch', 'root.json');

          specify('should refract the component to the expected type', async function () {
            const workflow = await dereferenceWorkflow(rootFilePath, 1);
            const step = workflow.steps.get(0);
            const parameter = step.parameters.get(0);
            const successAction = step.onSuccess.get(0);

            assert.isTrue(isParameterElement(parameter));
            assert.deepEqual(toValue(parameter), {
              name: 'jump',
              type: 'goto',
              workflowId: 'target',
              parameters: [{ reference: '$components.successActions.jump' }],
              value: 'from-step',
            });
            assert.deepEqual(toValue(parameter.meta.get('ref-fields')), {
              reference: '$components.successActions.jump',
              value: 'from-step',
            });
            assert.strictEqual(toValue(parameter.meta.get('ref-type')), 'reusable');
            assert.isTrue(isSuccessActionElement(successAction));
            assert.deepEqual(toValue(successAction), {
              name: 'status',
              in: 'query',
              value: 'from-component',
            });
          });

          specify('should keep the components of their own type', async function () {
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const jump = (actual.api as any).components.successActions.get('jump');

            assert.isTrue(isSuccessActionElement(jump));
            assert.isTrue(isParameterElement(jump.parameters.get(0)));
            assert.strictEqual(toValue(jump.parameters.get(0).name), 'jump');
          });

          specify('should not form a cycle through the mismatch', async function () {
            const refSet = new ReferenceSet();
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: { circular: 'error', refSet },
            });

            assert.doesNotThrow(() => JSON.stringify(toValue(actual)));
            assert.isFalse(refSet.circular);
          });
        });

        context('given Source Descriptions parsed into the document', function () {
          const rootFilePath = path.join(rootFixturePath, 'source-description', 'root.json');
          const childOf = (actual: any) =>
            (actual.content as any[]).find(
              (item) => isParseResultElement(item) && includesClasses(item, ['source-description']),
            );

          specify('should leave the Source Descriptions as parsed', async function () {
            const actual = await dereference(rootFilePath, {
              parse: {
                mediaType: mediaTypes.latest('json'),
                parserOpts: { sourceDescriptions: true },
              },
            });
            const parameter = childOf(actual).api.workflows.get(0).steps.get(0).parameters.get(0);

            assert.isTrue(isReusableElement(parameter));
          });

          specify(
            'should dereference the Source Descriptions in their own context when requested',
            async function () {
              const actual = await dereference(rootFilePath, {
                parse: {
                  mediaType: mediaTypes.latest('json'),
                  parserOpts: { sourceDescriptions: true },
                },
                dereference: { strategyOpts: { sourceDescriptions: true } },
              });
              const parameter = childOf(actual).api.workflows.get(0).steps.get(0).parameters.get(0);

              assert.isTrue(isParameterElement(parameter));
              assert.deepEqual(toValue(parameter), { name: 'q', in: 'query', value: '2' });
            },
          );
        });

        context('given unresolvable Reusable Element nested in shared component', function () {
          const rootFilePath = path.join(rootFixturePath, 'nested-unresolvable', 'root.json');

          specify('should report the unresolvable Reusable Element once', async function () {
            const errors: UnresolvableReferenceError[] = [];
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                continueOnError: (error: UnresolvableReferenceError) => errors.push(error),
              },
            });
            const [{ workflows }] = toValue(actual) as any;

            assert.lengthOf(errors, 1);
            assert.strictEqual(
              (errors[0] as any).location,
              '/components/successActions/jump/parameters/0',
            );
            assert.deepEqual(workflows[0].steps[0].onSuccess, [
              {
                name: 'jump',
                type: 'end',
                parameters: [{ reference: '$components.parameters.nonExistent' }],
              },
              {
                name: 'jump',
                type: 'end',
                parameters: [{ reference: '$components.parameters.nonExistent' }],
              },
            ]);
          });
        });

        context('given immutable option', function () {
          const rootFilePath = path.join(rootFixturePath, 'nested-reusable', 'root.json');

          specify('should not edit the dereferenced document by default', async function () {
            const parseResult = await parse(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const jump = (parseResult.api as any).components.successActions.get('jump');
            const reusable = jump.parameters.get(0);

            await dereferenceWorkflow(rootFilePath, 1, { parseResult });

            assert.strictEqual(jump.parameters.get(0), reusable);
            assert.deepEqual(toValue(parseResult), [loadJsonFile(rootFilePath)]);
          });

          specify('should write the result back when immutable=false', async function () {
            const parseResult = await parse(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            const actual = await dereferenceApiDOM(parseResult, {
              parse: { mediaType: mediaTypes.latest('json') },
              resolve: { baseURI: rootFilePath },
              dereference: { immutable: false },
            });
            const expected = loadJsonFile(
              path.join(rootFixturePath, 'nested-reusable', 'dereferenced.json'),
            );

            assert.strictEqual(actual, parseResult);
            assert.deepEqual(toValue(parseResult), expected);
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
