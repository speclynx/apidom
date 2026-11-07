import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import sinon from 'sinon';
import { identity } from 'ramda';
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
import MaximumDereferenceDepthError from '../../../../../src/errors/MaximumDereferenceDepthError.ts';

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
  {
    dereference: dereferenceOptions = {},
    resolve: resolveOptions = {},
  }: { dereference?: Record<string, unknown>; resolve?: Record<string, unknown> } = {},
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
    resolve: { baseURI: rootFilePath, ...resolveOptions },
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
            assert.deepEqual(toValue(parameter.meta.get('ref-fields')), {
              reference: '$components.parameters.status',
              value: 'from-second',
            });
            assert.strictEqual(toValue(parameter.meta.get('ref-origin')), rootFilePath);
            assert.strictEqual(toValue(parameter.meta.get('ref-type')), 'reusable');
          });

          specify('should throw when dereference.maxDepth is exceeded', async function () {
            try {
              await dereferenceWorkflow(rootFilePath, 1, { dereference: { maxDepth: 1 } });
              assert.fail('should throw UnresolvableReferenceError');
            } catch (error: any) {
              assert.instanceOf(error, UnresolvableReferenceError);
              assert.instanceOf(error.cause, MaximumDereferenceDepthError);
            }
          });
        });

        context('given Reusable Elements sharing components', function () {
          const rootFilePath = path.join(rootFixturePath, 'diamond', 'root.json');
          const assertDereferenced = (action: any) => {
            for (let depth = 0; depth < 20; depth += 1) {
              assert.isTrue(isSuccessActionElement(action));
              assert.strictEqual(toValue(action.name), `a${depth}`);
              assert.isTrue(isSuccessActionElement(action.parameters.get(1)));
              action = action.parameters.get(0);
            }
            assert.strictEqual(toValue(action.name), 'a20');
          };

          specify('should dereference each shared component once', async function () {
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assertDereferenced((actual.api as any).workflows.get(0).steps.get(0).onSuccess.get(0));
          });

          specify(
            'should dereference each shared component once when dereferencing a Workflow fragment',
            async function () {
              const workflow = await dereferenceWorkflow(rootFilePath, 0);

              assertDereferenced(workflow.steps.get(0).onSuccess.get(0));
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

        context('given cycle of Reusable Elements across components', function () {
          const rootFilePath = path.join(rootFixturePath, 'cycle', 'root.json');
          const dereferenceDocument = async (dereferenceOptions: Record<string, unknown> = {}) => {
            const actual = await dereference(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: dereferenceOptions,
            });
            return (actual.api as any).workflows.get(1);
          };
          const assertCycles = (workflow: any) => {
            const [self, ping] = workflow.steps.get(0).onSuccess;

            assert.isTrue(isSuccessActionElement(self));
            assert.strictEqual(self.parameters.get(0).parameters, self.parameters);
            assert.isTrue(isSuccessActionElement(ping));
            assert.strictEqual(toValue(ping.parameters.get(0).name), 'pong');
            assert.strictEqual(
              ping.parameters.get(0).parameters.get(0).parameters,
              ping.parameters,
            );
          };
          const assertReplacements = (workflow: any) => {
            const [self, ping] = workflow.steps.get(0).onSuccess;
            const selfRef = self.parameters.get(0);
            const pong = ping.parameters.get(0);
            const pingRef = pong.parameters.get(0);

            assert.isTrue(isRefElement(selfRef));
            assert.strictEqual(toValue(selfRef), '$components.successActions.self');
            assert.strictEqual(toValue(selfRef.meta.get('type')), 'reusable');
            assert.strictEqual(
              toValue(selfRef.meta.get('reference')),
              '$components.successActions.self',
            );
            assert.isTrue(isSuccessActionElement(pong));
            assert.strictEqual(toValue(pong.name), 'pong');
            assert.isTrue(isRefElement(pingRef));
            assert.strictEqual(toValue(pingRef), '$components.successActions.ping');
          };

          context('given circular=ignore', function () {
            specify('should dereference and create cycles', async function () {
              const workflow = await dereferenceDocument({ circular: 'ignore' });

              assertCycles(workflow);
              assert.throws(() => JSON.stringify(toValue(workflow)));
            });

            specify(
              'should dereference and create cycles when dereferencing a Workflow fragment',
              async function () {
                assertCycles(await dereferenceWorkflow(rootFilePath, 1));
              },
            );
          });

          context('given circular=replace', function () {
            specify('should dereference and eliminate all cycles', async function () {
              const workflow = await dereferenceDocument({ circular: 'replace' });

              assertReplacements(workflow);
              assert.doesNotThrow(() => JSON.stringify(toValue(workflow)));
            });

            specify(
              'should dereference and eliminate all cycles when dereferencing a Workflow fragment',
              async function () {
                const workflow = await dereferenceWorkflow(rootFilePath, 1, {
                  dereference: { circular: 'replace' },
                });

                assertReplacements(workflow);
                assert.doesNotThrow(() => JSON.stringify(toValue(workflow)));
              },
            );

            specify('should mark the ReferenceSet as circular', async function () {
              const refSet = new ReferenceSet();
              await dereference(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: { circular: 'replace', immutable: false, refSet },
              });

              assert.isTrue(refSet.circular);
            });
          });

          context('given circular=replace and custom replacer is provided', function () {
            specify('should dereference and eliminate all cycles', async function () {
              const circularReplacer = sinon.spy(identity);

              await dereferenceDocument({ circular: 'replace', circularReplacer });

              assert.strictEqual(circularReplacer.callCount, 2);
              circularReplacer.getCalls().forEach((call) => {
                assert.isTrue(isRefElement(call.args[0]));
                assert.isTrue(isRefElement(call.returnValue));
              });
            });

            specify('should prefer arazzo-1 strategy specific replacer', async function () {
              const circularReplacer = sinon.spy(identity);
              const strategyCircularReplacer = sinon.spy(identity);

              await dereferenceDocument({
                circular: 'replace',
                circularReplacer,
                strategyOpts: { 'arazzo-1': { circularReplacer: strategyCircularReplacer } },
              });

              assert.isTrue(circularReplacer.notCalled);
              assert.strictEqual(strategyCircularReplacer.callCount, 2);
            });
          });

          context('given circular=error', function () {
            specify('should dereference and throw on first detected cycle', async function () {
              try {
                await dereferenceDocument({ circular: 'error' });
                assert.fail('should throw UnresolvableReferenceError');
              } catch (error: any) {
                assert.instanceOf(error, UnresolvableReferenceError);
                assert.strictEqual((error.cause as Error).message, 'Circular reference detected');
              }
            });

            specify(
              'should throw on first detected cycle when dereferencing a Workflow fragment',
              async function () {
                try {
                  await dereferenceWorkflow(rootFilePath, 1, {
                    dereference: { circular: 'error' },
                  });
                  assert.fail('should throw UnresolvableReferenceError');
                } catch (error: any) {
                  assert.instanceOf(error, UnresolvableReferenceError);
                  assert.strictEqual((error.cause as Error).message, 'Circular reference detected');
                }
              },
            );

            specify('should report the cycle when continueOnError is set', async function () {
              const errors: UnresolvableReferenceError[] = [];
              await dereferenceDocument({
                circular: 'error',
                continueOnError: (error: UnresolvableReferenceError) => errors.push(error),
              });

              assert.deepEqual(
                errors.map((error: any) => [error.refFieldValue, error.location]),
                [
                  [
                    '$components.successActions.self',
                    '/components/successActions/self/parameters/0',
                  ],
                  [
                    '$components.successActions.ping',
                    '/components/successActions/pong/parameters/0',
                  ],
                ],
              );
            });
          });
        });

        context('given cycle of Reusable Elements referenced from several places', function () {
          const fixturePath = path.join(rootFixturePath, 'cycle-orders');

          ['workflows-first.json', 'components-first.json'].forEach((fixture) => {
            context(`given ${fixture}`, function () {
              const rootFilePath = path.join(fixturePath, fixture);

              specify('should report the cycle once when circular=error', async function () {
                const errors: UnresolvableReferenceError[] = [];
                await dereference(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                  dereference: {
                    circular: 'error',
                    continueOnError: (error: UnresolvableReferenceError) => errors.push(error),
                  },
                });

                assert.lengthOf(errors, 1);
                assert.strictEqual(
                  (errors[0].cause as Error).message,
                  'Circular reference detected',
                );
              });

              specify('should eliminate all cycles when circular=replace', async function () {
                const actual = await dereference(rootFilePath, {
                  parse: { mediaType: mediaTypes.latest('json') },
                  dereference: { circular: 'replace' },
                });

                assert.doesNotThrow(() => JSON.stringify(toValue(actual)));
              });

              [0, 1, 2].forEach((index) => {
                specify(
                  `should detect the cycle when dereferencing Workflow fragment #${index}`,
                  async function () {
                    const workflow = await dereferenceWorkflow(rootFilePath, index, {
                      dereference: { circular: 'replace' },
                    });

                    assert.doesNotThrow(() => JSON.stringify(toValue(workflow)));

                    try {
                      await dereferenceWorkflow(rootFilePath, index, {
                        dereference: { circular: 'error' },
                      });
                      assert.fail('should throw UnresolvableReferenceError');
                    } catch (error: any) {
                      assert.instanceOf(error, UnresolvableReferenceError);
                      assert.strictEqual(
                        (error.cause as Error).message,
                        'Circular reference detected',
                      );
                    }
                  },
                );
              });
            });
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
