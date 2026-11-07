import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { cloneShallow, isRefElement, ParseResultElement } from '@speclynx/apidom-datamodel';
import {
  isParameterElement,
  isSuccessActionElement,
  mediaTypes,
  WorkflowElement,
} from '@speclynx/apidom-ns-arazzo-1';

import { loadJsonFile } from '../../../../helpers.ts';
import {
  dereference,
  dereferenceApiDOM,
  parse,
  Reference,
  ReferenceSet,
} from '../../../../../src/index.ts';
import UnresolvableReferenceError from '../../../../../src/errors/UnresolvableReferenceError.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

/**
 * Dereferences a single Workflow the way dereferencing of a fragment is done in
 * practice: the fragment is the root of the ReferenceSet, the whole document is
 * registered next to it so that components can be resolved.
 */
const dereferenceWorkflow = async (
  rootFilePath: string,
  index: number,
  dereferenceOptions: Record<string, unknown> = {},
): Promise<any> => {
  const parseResult = await parse(rootFilePath, {
    parse: { mediaType: mediaTypes.latest('json') },
  });
  const workflow = (parseResult.api as any).workflows.get(index) as WorkflowElement;
  const workflowClone = cloneShallow(workflow);
  workflowClone.classes.push('result');
  const refSet = new ReferenceSet();
  refSet
    .add(
      new Reference({
        uri: `${rootFilePath}#fragment`,
        value: new ParseResultElement([workflowClone]),
      }),
    )
    .add(new Reference({ uri: rootFilePath, value: parseResult }));

  return dereferenceApiDOM(workflow, {
    parse: { mediaType: mediaTypes.latest('json') },
    resolve: { baseURI: rootFilePath },
    dereference: { refSet, ...dereferenceOptions },
  });
};

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

          specify('should dereference', async function () {
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const expected = loadJsonFile(path.join(fixturePath, 'dereferenced.json'));

            assert.deepEqual(toValue(actual), expected);
          });

          specify('should dereference when dereferencing a Workflow fragment', async function () {
            const workflow = await dereferenceWorkflow(rootFilePath, 1);
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
          });
        });

        context('given chain of Reusable Elements across components', function () {
          const rootFilePath = path.join(rootFixturePath, 'chain', 'root.json');

          specify('should dereference every level', async function () {
            const workflow = await dereferenceWorkflow(rootFilePath, 1);
            const first = workflow.steps.get(0).onSuccess.get(0);
            const second = first.parameters.get(0);
            const parameter = second.parameters.get(0);

            assert.isTrue(isSuccessActionElement(first));
            assert.isTrue(isSuccessActionElement(second));
            assert.propertyVal(
              toValue(second.meta.get('ref-fields')) as Record<string, unknown>,
              'reference',
              '$components.successActions.second',
            );
            assert.isTrue(isParameterElement(parameter));
            assert.deepEqual(toValue(parameter), {
              name: 'status',
              in: 'query',
              value: 'from-second',
            });
          });
        });

        context('given cycle of Reusable Elements across components', function () {
          const rootFilePath = path.join(rootFixturePath, 'cycle', 'root.json');

          specify('should terminate when circular=ignore', async function () {
            const workflow = await dereferenceWorkflow(rootFilePath, 1);
            const [self, ping] = workflow.steps.get(0).onSuccess;

            assert.isTrue(isSuccessActionElement(self));
            assert.isTrue(isSuccessActionElement(self.parameters.get(0)));
            assert.isTrue(isSuccessActionElement(ping));
            assert.isTrue(isSuccessActionElement(ping.parameters.get(0)));
          });

          specify('should throw UnresolvableReferenceError when circular=error', async function () {
            try {
              await dereferenceWorkflow(rootFilePath, 1, { circular: 'error' });
              assert.fail('should throw UnresolvableReferenceError');
            } catch (error: any) {
              assert.instanceOf(error, UnresolvableReferenceError);
              assert.strictEqual((error.cause as Error).message, 'Circular reference detected');
            }
          });

          specify('should replace cycle with RefElement when circular=replace', async function () {
            const workflow = await dereferenceWorkflow(rootFilePath, 1, { circular: 'replace' });
            const [self, ping] = workflow.steps.get(0).onSuccess;
            const selfRef = self.parameters.get(0);
            const pingRef = ping.parameters.get(0).parameters.get(0);

            assert.isTrue(isRefElement(selfRef));
            assert.strictEqual(toValue(selfRef), '$components.successActions.self');
            assert.isTrue(isRefElement(pingRef));
            assert.strictEqual(toValue(pingRef), '$components.successActions.ping');
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
