import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { isParseResultElement, ParseResultElement } from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-ns-arazzo-1';

import { dereference } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('dereference', function () {
  context('strategies', function () {
    context('arazzo-1', function () {
      context('sourceDescriptions', function () {
        context('given sourceDescriptions enabled', function () {
          specify('should dereference external source descriptions', async function () {
            const uri = path.join(rootFixturePath, 'root.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            assert.strictEqual(dereferenceResult.length, 2);

            const sdResult = dereferenceResult.get(1)!;
            assert.isTrue(isParseResultElement(sdResult));
            assert.isTrue(sdResult.classes.includes('source-description'));
            assert.strictEqual(sdResult.meta.get('name')!.toValue(), 'petStore');
            assert.strictEqual(sdResult.meta.get('type')!.toValue(), 'openapi');
          });
        });

        context('given sourceDescriptions disabled', function () {
          specify('should not dereference external source descriptions', async function () {
            const uri = path.join(rootFixturePath, 'root.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            assert.strictEqual(dereferenceResult.length, 1);
          });
        });

        context('given sourceDescriptions explicitly set to false', function () {
          specify('should not dereference external source descriptions', async function () {
            const uri = path.join(rootFixturePath, 'root.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: false },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            assert.strictEqual(dereferenceResult.length, 1);
          });
        });

        context('given Arazzo as source description', function () {
          specify('should dereference recursively', async function () {
            const uri = path.join(rootFixturePath, 'root-recursive.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            // root + nested arazzo (with its openapi source description)
            assert.strictEqual(dereferenceResult.length, 2);

            // nested arazzo result
            const nestedArazzo = dereferenceResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(nestedArazzo));
            assert.isTrue(nestedArazzo.classes.includes('source-description'));
            assert.strictEqual(nestedArazzo.meta.get('name')!.toValue(), 'nestedArazzo');
            assert.strictEqual(nestedArazzo.meta.get('type')!.toValue(), 'arazzo');
            // nested arazzo has its own source description (openapi)
            assert.strictEqual(nestedArazzo.length, 2);

            // openapi result inside nested arazzo
            const openapi = nestedArazzo.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(openapi));
            assert.isTrue(openapi.classes.includes('source-description'));
            assert.strictEqual(openapi.meta.get('name')!.toValue(), 'petStore');
            assert.strictEqual(openapi.meta.get('type')!.toValue(), 'openapi');
          });
        });

        context('given sourceDescriptionsMaxDepth option', function () {
          specify('should add error annotation when max depth is exceeded', async function () {
            const uri = path.join(rootFixturePath, 'root-recursive.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: true, sourceDescriptionsMaxDepth: 1 },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            // root + nested arazzo (with its source descriptions as error annotation)
            assert.strictEqual(dereferenceResult.length, 2);

            // nested arazzo result should contain the arazzo API + annotation for max depth
            const nestedArazzo = dereferenceResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(nestedArazzo));
            assert.isTrue(nestedArazzo.classes.includes('source-description'));
            assert.strictEqual(nestedArazzo.length, 2); // arazzo API + annotation result

            // First element is the nested arazzo API
            assert.strictEqual(nestedArazzo.get(0)?.element, 'arazzoSpecification1');

            // Second element is a result with error annotation (from nested's blocked source descriptions)
            const annotationResult = nestedArazzo.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(annotationResult));
            assert.isTrue(annotationResult.classes.includes('source-description'));

            const annotation = annotationResult.get(0);
            assert.strictEqual(annotation?.element, 'annotation');
            assert.isTrue(annotation?.classes.includes('error'));
            assert.include(
              annotation?.toValue(),
              'Maximum dereference depth of 1 has been exceeded',
            );
          });
        });

        context('given circular source descriptions', function () {
          specify('should handle cycles by skipping visited URLs', async function () {
            const uri = path.join(rootFixturePath, 'circular-a.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            // root + circular-b (which tries to reference circular-a but should be skipped)
            assert.strictEqual(dereferenceResult.length, 2);

            // circular-b result
            const circularB = dereferenceResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(circularB));
            assert.isTrue(circularB.classes.includes('source-description'));

            // circular-b has its source description which should be a warning annotation
            assert.strictEqual(circularB.length, 2);

            // First element is circular-b's arazzo API
            assert.strictEqual(circularB.get(0)?.element, 'arazzoSpecification1');

            // Second element is a result with warning about cycle
            const cycleResult = circularB.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(cycleResult));

            const annotation = cycleResult.get(0);
            assert.strictEqual(annotation?.element, 'annotation');
            assert.isTrue(annotation?.classes.includes('warning'));
            assert.include(annotation?.toValue(), 'has already been visited');
          });
        });

        context('given sourceDescriptions as array of names', function () {
          specify('should dereference only specified source descriptions', async function () {
            const uri = path.join(rootFixturePath, 'root-multi.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: ['petStore'] },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            // root + only petStore (not nestedArazzo)
            assert.strictEqual(dereferenceResult.length, 2);

            const sdResult = dereferenceResult.get(1)!;
            assert.isTrue(isParseResultElement(sdResult));
            assert.strictEqual(sdResult.meta.get('name')!.toValue(), 'petStore');
          });

          specify(
            'should dereference single source description when array has one name',
            async function () {
              const uri = path.join(rootFixturePath, 'root-multi.json');
              const dereferenceResult = await dereference(uri, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: {
                  strategyOpts: {
                    'arazzo-1': { sourceDescriptions: ['nestedArazzo'] },
                  },
                },
              });

              assert.isTrue(isParseResultElement(dereferenceResult));
              assert.strictEqual(dereferenceResult.length, 2);

              const sdResult = dereferenceResult.get(1)! as ParseResultElement;
              assert.isTrue(isParseResultElement(sdResult));
              assert.strictEqual(sdResult.meta.get('name')!.toValue(), 'nestedArazzo');
            },
          );

          specify(
            'should return no source descriptions when array has no matching names',
            async function () {
              const uri = path.join(rootFixturePath, 'root-multi.json');
              const dereferenceResult = await dereference(uri, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: {
                  strategyOpts: {
                    'arazzo-1': { sourceDescriptions: ['nonExistent'] },
                  },
                },
              });

              assert.isTrue(isParseResultElement(dereferenceResult));
              assert.strictEqual(dereferenceResult.length, 1);
            },
          );

          specify('should return no source descriptions when array is empty', async function () {
            const uri = path.join(rootFixturePath, 'root-multi.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'arazzo-1': { sourceDescriptions: [] },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            assert.strictEqual(dereferenceResult.length, 1);
          });
        });
      });
    });
  });
});
