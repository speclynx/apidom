import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { Element, isParseResultElement } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-0';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle } from '../../../../../src/index.ts';
import OpenAPI3_0BundleStrategy from '../../../../../src/bundle/strategies/openapi-3-0/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('bundle', function () {
  context('strategies', function () {
    context('openapi-3-0', function () {
      context('Reference Object', function () {
        context('given Reference Objects pointing internally and externally', function () {
          const fixturePath = path.join(rootFixturePath, 'internal-external');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should produce a ParseResultElement', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.isTrue(isParseResultElement(bundled));
          });

          specify('should hoist external Parameter Object into components', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const fragment = evaluate<Element>(
              bundled.result as Element,
              '/components/parameters/externalParameter',
            );

            assert.strictEqual(toValue(fragment).name, 'filter');
          });

          specify('should hoist external Response Object into components', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const fragment = evaluate<Element>(
              bundled.result as Element,
              '/components/responses/externalResponse',
            );

            assert.strictEqual(toValue(fragment).description, 'external response');
          });

          specify('should rewrite external $refs to internal pointers', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.deepEqual(value.paths['/users/{userId}'].get.parameters, [
              { $ref: '#/components/parameters/userId' },
              { $ref: '#/components/parameters/externalParameter' },
            ]);
            assert.deepEqual(value.paths['/users/{userId}'].get.responses['200'], {
              $ref: '#/components/responses/externalResponse',
            });
          });

          specify('should preserve internal Reference Objects untouched', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.strictEqual(value.components.parameters.userId.name, 'userId');
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ex.json');
          });

          specify(
            'should leave external $refs intact given resolve.external=false',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { external: false },
              });
              const serialized = JSON.stringify(toValue(bundled.result as Element));

              assert.include(serialized, 'ex.json');
            },
          );

          specify('should keep internal $refs as internal references', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.deepEqual(value.paths['/users/{userId}'].get.parameters[0], {
              $ref: '#/components/parameters/userId',
            });
          });
        });

        context('given a self-file Reference Object', function () {
          const fixturePath = path.join(rootFixturePath, 'self-file');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should normalize the $ref to a bare fragment', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.deepEqual(value.paths['/users'].get.parameters[0], {
              $ref: '#/components/parameters/userId',
            });
          });

          specify('should produce a transferable document', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'root.json');
          });
        });

        context('given external references with deeply equal targets', function () {
          const fixturePath = path.join(rootFixturePath, 'dedup-equal');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should collapse them into a single component', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.lengthOf(Object.keys(value.components.parameters), 1);
          });

          specify('should point both references at the same component', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.strictEqual(
              value.paths['/a'].get.parameters[0].$ref,
              value.paths['/b'].get.parameters[0].$ref,
            );
          });
        });

        context('given external references colliding on name with different content', function () {
          const fixturePath = path.join(rootFixturePath, 'collision-different');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should keep both as distinct, suffix-renamed components', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.lengthOf(Object.keys(value.components.parameters), 2);
            assert.notStrictEqual(
              value.paths['/a'].get.parameters[0].$ref,
              value.paths['/b'].get.parameters[0].$ref,
            );
          });

          specify('should warn about the rename via a parse-result annotation', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.lengthOf(bundled.warnings, 1);
            assert.include(toValue(bundled.warnings.first as Element) as string, 'Renamed');
          });

          specify(
            'should suppress the warning given onComponentNameCollision="off"',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: {
                  strategies: [new OpenAPI3_0BundleStrategy({ onComponentNameCollision: 'off' })],
                },
              });

              assert.lengthOf(bundled.warnings, 0);
            },
          );

          specify('should throw given onComponentNameCollision="error"', async function () {
            try {
              await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
                bundle: {
                  strategies: [new OpenAPI3_0BundleStrategy({ onComponentNameCollision: 'error' })],
                },
              });
              assert.fail('should have thrown');
            } catch (error: any) {
              assert.strictEqual(error.constructor.name, 'BundleError');
            }
          });
        });

        context('given an external reference with a dotted JSON Pointer key', function () {
          const fixturePath = path.join(rootFixturePath, 'dotted-pointer-keys');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should preserve the dotted key as the component name', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.property(value.components.schemas, 'my.org.User');
            assert.strictEqual(
              value.paths['/a'].get.responses['200'].content['application/json'].schema.$ref,
              '#/components/schemas/my.org.User',
            );
          });
        });

        context('given nested external Reference Objects', function () {
          const fixturePath = path.join(rootFixturePath, 'external-nested');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should transitively hoist nested external fragments', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'a.json');
            assert.notInclude(serialized, 'b.json');
          });

          specify('should hoist the top-level external Response Object', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const fragment = evaluate<Element>(
              bundled.result as Element,
              '/components/responses/Pet',
            );

            assert.isDefined(toValue(fragment));
          });
        });

        context('given circular external Schema Objects', function () {
          const fixturePath = path.join(rootFixturePath, 'external-circular-schema');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should terminate and hoist both schemas once', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.hasAllKeys(value.components.schemas, ['A', 'B']);
          });

          specify('should rewrite the cycle to internal pointers', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.deepEqual(value.components.schemas.A.properties.b, {
              $ref: '#/components/schemas/B',
            });
            assert.deepEqual(value.components.schemas.B.properties.a, {
              $ref: '#/components/schemas/A',
            });
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ex.json');
          });
        });

        context('given external references across all Components Object fields', function () {
          const fixturePath = path.join(rootFixturePath, 'all-component-types');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should hoist each into its matching components field', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.property(value.components.requestBodies, 'RB');
            assert.property(value.components.parameters, 'Param');
            assert.property(value.components.headers, 'Head');
            assert.property(value.components.callbacks, 'CB');
            assert.property(value.components.securitySchemes, 'Sec');
          });

          specify('should rewrite every reference to an internal pointer', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);
            const operation = value.paths['/a'].post;

            assert.strictEqual(operation.requestBody.$ref, '#/components/requestBodies/RB');
            assert.strictEqual(operation.parameters[0].$ref, '#/components/parameters/Param');
            assert.strictEqual(
              operation.responses['200'].headers['X-H'].$ref,
              '#/components/headers/Head',
            );
            assert.strictEqual(operation.callbacks.cb.$ref, '#/components/callbacks/CB');
          });

          specify('should produce a document without external $refs', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const serialized = JSON.stringify(toValue(bundled.result as Element));

            assert.notInclude(serialized, 'ex.json');
          });
        });

        context('given a document with null values', function () {
          const fixturePath = path.join(rootFixturePath, 'with-nulls');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify('should bundle without failing', async function () {
            const bundled = await bundle(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const value = toValue(bundled.result as Element);

            assert.property(value.components.parameters, 'NullableParam');
          });
        });

        context('given an external $ref inside a specification extension field', function () {
          const fixturePath = path.join(rootFixturePath, 'extension-ref');
          const rootFilePath = path.join(fixturePath, 'root.json');

          specify(
            'should leave the extension $ref untouched (consistent with dereference)',
            async function () {
              const bundled = await bundle(rootFilePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const value = toValue(bundled.result as Element);

              assert.deepEqual(value.paths['/a'].get['x-custom'], {
                schema: { $ref: './ex.json#/ExtSchema' },
              });
            },
          );
        });
      });
    });
  });
});
