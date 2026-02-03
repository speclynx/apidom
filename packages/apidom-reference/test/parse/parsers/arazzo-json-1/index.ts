import fs from 'node:fs';
import path from 'node:path';
import { assert } from 'chai';
import {
  NumberElement,
  ParseResultElement,
  isParseResultElement,
  hasElementSourceMap,
} from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-parser-adapter-arazzo-json-1';
import { fileURLToPath } from 'node:url';

import File from '../../../../src/File.ts';
import ArazzoJSON1Parser from '../../../../src/parse/parsers/arazzo-json-1/index.ts';
import { parse } from '../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('parsers', function () {
  context('ArazzoJSON1Parser', function () {
    context('canParse', function () {
      context('given file with .json extension', function () {
        context('and with proper media type', function () {
          specify('should return true', async function () {
            const file1 = new File({
              uri: '/path/to/arazzo.json',
              mediaType: mediaTypes.latest('generic'),
            });
            const file2 = new File({
              uri: '/path/to/arazzo.json',
              mediaType: mediaTypes.latest('json'),
            });
            const parser = new ArazzoJSON1Parser();

            assert.isTrue(await parser.canParse(file1));
            assert.isTrue(await parser.canParse(file2));
          });
        });

        context('and with improper media type', function () {
          specify('should return false', async function () {
            const file = new File({
              uri: '/path/to/arazzo.json',
              mediaType: 'application/vnd.aai.asyncapi+json;version=2.6.0',
            });
            const parser = new ArazzoJSON1Parser();

            assert.isFalse(await parser.canParse(file));
          });
        });
      });

      context('given file with unknown extension', function () {
        specify('should return false', async function () {
          const file = new File({
            uri: '/path/to/arazzo.yaml',
            mediaType: mediaTypes.latest('json'),
          });
          const parser = new ArazzoJSON1Parser({ fileExtensions: ['.json'] });

          assert.isFalse(await parser.canParse(file));
        });
      });

      context('given file with no extension', function () {
        specify('should return false', async function () {
          const file = new File({
            uri: '/path/to/arazzo',
            mediaType: mediaTypes.latest('json'),
          });
          const parser = new ArazzoJSON1Parser({ fileExtensions: ['.json'] });

          assert.isFalse(await parser.canParse(file));
        });
      });

      context('given file with supported extension', function () {
        context('and file data is buffer and can be detected as Arazzo 1.0.1', function () {
          specify('should return true', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-workflow.json');
            const file = new File({
              uri: '/path/to/arazzo.json',
              data: fs.readFileSync(uri),
            });
            const parser = new ArazzoJSON1Parser();

            assert.isTrue(await parser.canParse(file));
          });
        });

        context('and file data is string and can be detected as Arazzo 1.0.1', function () {
          specify('should return true', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-workflow.json');
            const file = new File({
              uri: '/path/to/arazzo.json',
              data: fs.readFileSync(uri).toString(),
            });
            const parser = new ArazzoJSON1Parser();

            assert.isTrue(await parser.canParse(file));
          });
        });
      });
    });

    context('parse', function () {
      context('given Arazzo 1.0.0 JSON data', function () {
        specify('should return parse result', async function () {
          const uri = path.join(__dirname, 'fixtures', 'sample-workflow.json');
          const data = fs.readFileSync(uri).toString();
          const file = new File({
            uri,
            data,
            mediaType: mediaTypes.latest('json'),
          });
          const parser = new ArazzoJSON1Parser();
          const parseResult = await parser.parse(file);

          assert.isTrue(isParseResultElement(parseResult));
        });
      });

      context('given Arazzo 1.0.0 JSON data as buffer', function () {
        specify('should return parse result', async function () {
          const uri = path.join(__dirname, 'fixtures', 'sample-workflow.json');
          const data = fs.readFileSync(uri);
          const file = new File({
            uri,
            data,
            mediaType: mediaTypes.latest('json'),
          });
          const parser = new ArazzoJSON1Parser();
          const parseResult = await parser.parse(file);

          assert.isTrue(isParseResultElement(parseResult));
        });
      });

      context('given data that is not a Arazzo 1.0.0 JSON data', function () {
        specify('should coerce to string and parse', async function () {
          const file = new File({
            uri: '/path/to/file.json',
            data: 1 as any,
            mediaType: mediaTypes.latest('json'),
          });
          const parser = new ArazzoJSON1Parser();
          const parseResult = await parser.parse(file);
          const numberElement = parseResult.get(0) as NumberElement;

          assert.isTrue(isParseResultElement(parseResult));
          assert.isTrue(numberElement.equals(1));
        });
      });

      context('given empty file', function () {
        specify('should return empty parse result', async function () {
          const file = new File({
            uri: '/path/to/file.json',
            data: '',
            mediaType: mediaTypes.latest('json'),
          });
          const parser = new ArazzoJSON1Parser();
          const parseResult = await parser.parse(file);

          assert.isTrue(isParseResultElement(parseResult));
          assert.isTrue(parseResult.isEmpty);
        });
      });

      context('sourceMap', function () {
        context('given sourceMap enabled', function () {
          specify('should decorate ApiDOM with source maps', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-workflow.json');
            const data = fs.readFileSync(uri).toString();
            const file = new File({
              uri,
              data,
              mediaType: mediaTypes.latest('json'),
            });
            const parser = new ArazzoJSON1Parser({ sourceMap: true, strict: false });
            const parseResult = await parser.parse(file);

            assert.isTrue(hasElementSourceMap(parseResult.api!));
          });
        });

        context('given sourceMap disabled', function () {
          specify('should not decorate ApiDOM with source maps', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-workflow.json');
            const data = fs.readFileSync(uri).toString();
            const file = new File({
              uri,
              data,
              mediaType: mediaTypes.latest('json'),
            });
            const parser = new ArazzoJSON1Parser();
            const parseResult = await parser.parse(file);

            assert.isFalse(hasElementSourceMap(parseResult.api!));
          });
        });
      });

      context('sourceDescriptions', function () {
        context('given sourceDescriptions enabled', function () {
          specify('should parse external source descriptions', async function () {
            const uri = path.join(__dirname, 'fixtures', 'source-descriptions', 'root.json');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'arazzo-json-1': { sourceDescriptions: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(parseResult));
            assert.strictEqual(parseResult.length, 2);

            const sdParseResult = parseResult.get(1)!;
            assert.isTrue(isParseResultElement(sdParseResult));
            assert.isTrue(sdParseResult.classes.includes('source-description'));
            assert.strictEqual(sdParseResult.meta.get('name')!.toValue(), 'petStore');
            assert.strictEqual(sdParseResult.meta.get('type')!.toValue(), 'openapi');
          });
        });

        context('given sourceDescriptions disabled', function () {
          specify('should not parse external source descriptions', async function () {
            const uri = path.join(__dirname, 'fixtures', 'source-descriptions', 'root.json');
            const parseResult = await parse(uri);

            assert.isTrue(isParseResultElement(parseResult));
            assert.strictEqual(parseResult.length, 1);
          });
        });

        context('given sourceDescriptions explicitly set to false', function () {
          specify('should not parse external source descriptions', async function () {
            const uri = path.join(__dirname, 'fixtures', 'source-descriptions', 'root.json');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'arazzo-json-1': { sourceDescriptions: false },
                },
              },
            });

            assert.isTrue(isParseResultElement(parseResult));
            assert.strictEqual(parseResult.length, 1);
          });
        });

        context('given Arazzo as source description', function () {
          specify('should parse recursively', async function () {
            const uri = path.join(
              __dirname,
              'fixtures',
              'source-descriptions-recursive',
              'root.json',
            );
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'arazzo-json-1': { sourceDescriptions: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(parseResult));
            // root + nested arazzo (with its openapi source description)
            assert.strictEqual(parseResult.length, 2);

            // nested arazzo parse result
            const nestedArazzo = parseResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(nestedArazzo));
            assert.isTrue(nestedArazzo.classes.includes('source-description'));
            assert.strictEqual(nestedArazzo.meta.get('name')!.toValue(), 'nestedWorkflow');
            assert.strictEqual(nestedArazzo.meta.get('type')!.toValue(), 'arazzo');
            // nested arazzo has its own source description (openapi)
            assert.strictEqual(nestedArazzo.length, 2);

            // openapi parse result inside nested arazzo
            const openapi = nestedArazzo.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(openapi));
            assert.isTrue(openapi.classes.includes('source-description'));
            assert.strictEqual(openapi.meta.get('name')!.toValue(), 'petStore');
            assert.strictEqual(openapi.meta.get('type')!.toValue(), 'openapi');
          });
        });

        context('given sourceDescriptionsMaxDepth option', function () {
          specify('should add error annotation when max depth is exceeded', async function () {
            const uri = path.join(
              __dirname,
              'fixtures',
              'source-descriptions-recursive',
              'root.json',
            );
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'arazzo-json-1': { sourceDescriptions: true, sourceDescriptionsMaxDepth: 1 },
                },
              },
            });

            assert.isTrue(isParseResultElement(parseResult));
            // root + nested arazzo (with its source descriptions as error annotation)
            assert.strictEqual(parseResult.length, 2);

            // nested arazzo parse result should contain the arazzo API + annotation for max depth
            const nestedArazzo = parseResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(nestedArazzo));
            assert.isTrue(nestedArazzo.classes.includes('source-description'));
            assert.strictEqual(nestedArazzo.length, 2); // arazzo API + annotation result

            // First element is the nested arazzo API
            assert.strictEqual(nestedArazzo.get(0)?.element, 'arazzoSpecification1');

            // Second element is a parse result with error annotation (from nested's blocked source descriptions)
            const annotationResult = nestedArazzo.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(annotationResult));
            assert.isTrue(annotationResult.classes.includes('source-description'));

            const annotation = annotationResult.get(0);
            assert.strictEqual(annotation?.element, 'annotation');
            assert.isTrue(annotation?.classes.includes('error'));
            assert.include(annotation?.toValue(), 'Maximum parse depth of 1 has been exceeded');
          });
        });

        context('given circular source descriptions', function () {
          specify('should handle cycles by skipping visited URLs', async function () {
            const uri = path.join(__dirname, 'fixtures', 'source-descriptions-cycle', 'a.json');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'arazzo-json-1': { sourceDescriptions: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(parseResult));
            // a.json + b.json (b.json should not re-parse a.json due to cycle detection)
            assert.strictEqual(parseResult.length, 2);

            // b.json parse result
            const workflowB = parseResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(workflowB));
            assert.strictEqual(workflowB.meta.get('name')!.toValue(), 'workflowB');
            // b.json should have arazzo API + cycle warning annotation
            assert.strictEqual(workflowB.length, 2);

            // Check for cycle warning annotation
            const cycleAnnotationResult = workflowB.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(cycleAnnotationResult));
            const cycleAnnotation = cycleAnnotationResult.get(0);
            assert.strictEqual(cycleAnnotation?.element, 'annotation');
            assert.isTrue(cycleAnnotation?.classes.includes('warning'));
            assert.include(cycleAnnotation?.toValue(), 'has already been visited');
          });
        });

        context('given type mismatch between declared and actual type', function () {
          specify(
            'should add warning when declared openapi but actual is arazzo',
            async function () {
              const uri = path.join(
                __dirname,
                'fixtures',
                'source-descriptions-type-mismatch',
                'root.json',
              );
              const parseResult = await parse(uri, {
                parse: {
                  parserOpts: {
                    'arazzo-json-1': { sourceDescriptions: ['declaredOpenApiActualArazzo'] },
                  },
                },
              });

              assert.isTrue(isParseResultElement(parseResult));
              assert.strictEqual(parseResult.length, 2);

              const sdParseResult = parseResult.get(1)! as ParseResultElement;
              assert.isTrue(isParseResultElement(sdParseResult));
              // should have arazzo API + warning annotation
              assert.strictEqual(sdParseResult.length, 2);

              const annotation = sdParseResult.get(1);
              assert.strictEqual(annotation?.element, 'annotation');
              assert.isTrue(annotation?.classes.includes('warning'));
              assert.include(annotation?.toValue(), 'declared as "openapi" but parsed as Arazzo');
            },
          );

          specify(
            'should add warning when declared arazzo but actual is openapi',
            async function () {
              const uri = path.join(
                __dirname,
                'fixtures',
                'source-descriptions-type-mismatch',
                'root.json',
              );
              const parseResult = await parse(uri, {
                parse: {
                  parserOpts: {
                    'arazzo-json-1': { sourceDescriptions: ['declaredArazzoActualOpenApi'] },
                  },
                },
              });

              assert.isTrue(isParseResultElement(parseResult));
              assert.strictEqual(parseResult.length, 2);

              const sdParseResult = parseResult.get(1)! as ParseResultElement;
              assert.isTrue(isParseResultElement(sdParseResult));
              // should have openapi API + warning annotation
              assert.strictEqual(sdParseResult.length, 2);

              const annotation = sdParseResult.get(1);
              assert.strictEqual(annotation?.element, 'annotation');
              assert.isTrue(annotation?.classes.includes('warning'));
              assert.include(annotation?.toValue(), 'declared as "arazzo" but parsed as OpenAPI');
            },
          );
        });

        context('given sourceDescriptions as array of names', function () {
          specify('should parse only specified source descriptions', async function () {
            const uri = path.join(__dirname, 'fixtures', 'source-descriptions-filter', 'root.json');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'arazzo-json-1': { sourceDescriptions: ['petStore', 'paymentApi'] },
                },
              },
            });

            assert.isTrue(isParseResultElement(parseResult));
            // root + petStore + paymentApi (userService should be skipped)
            assert.strictEqual(parseResult.length, 3);

            // first source description should be petStore
            const petStoreResult = parseResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(petStoreResult));
            assert.isTrue(petStoreResult.classes.includes('source-description'));
            assert.strictEqual(petStoreResult.meta.get('name')!.toValue(), 'petStore');

            // second source description should be paymentApi
            const paymentResult = parseResult.get(2)! as ParseResultElement;
            assert.isTrue(isParseResultElement(paymentResult));
            assert.isTrue(paymentResult.classes.includes('source-description'));
            assert.strictEqual(paymentResult.meta.get('name')!.toValue(), 'paymentApi');
          });

          specify(
            'should parse single source description when array has one name',
            async function () {
              const uri = path.join(
                __dirname,
                'fixtures',
                'source-descriptions-filter',
                'root.json',
              );
              const parseResult = await parse(uri, {
                parse: {
                  parserOpts: {
                    'arazzo-json-1': { sourceDescriptions: ['userService'] },
                  },
                },
              });

              assert.isTrue(isParseResultElement(parseResult));
              // root + userService only
              assert.strictEqual(parseResult.length, 2);

              const userServiceResult = parseResult.get(1)! as ParseResultElement;
              assert.isTrue(isParseResultElement(userServiceResult));
              assert.isTrue(userServiceResult.classes.includes('source-description'));
              assert.strictEqual(userServiceResult.meta.get('name')!.toValue(), 'userService');
            },
          );

          specify(
            'should return no source descriptions when array has no matching names',
            async function () {
              const uri = path.join(
                __dirname,
                'fixtures',
                'source-descriptions-filter',
                'root.json',
              );
              const parseResult = await parse(uri, {
                parse: {
                  parserOpts: {
                    'arazzo-json-1': { sourceDescriptions: ['nonExistent'] },
                  },
                },
              });

              assert.isTrue(isParseResultElement(parseResult));
              // root only, no source descriptions matched
              assert.strictEqual(parseResult.length, 1);
            },
          );

          specify('should return no source descriptions when array is empty', async function () {
            const uri = path.join(__dirname, 'fixtures', 'source-descriptions-filter', 'root.json');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'arazzo-json-1': { sourceDescriptions: [] },
                },
              },
            });

            assert.isTrue(isParseResultElement(parseResult));
            // root only, empty array means no source descriptions
            assert.strictEqual(parseResult.length, 1);
          });
        });
      });
    });
  });
});
