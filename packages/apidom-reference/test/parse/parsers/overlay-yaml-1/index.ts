import fs from 'node:fs';
import path from 'node:path';
import { assert } from 'chai';
import {
  NumberElement,
  ParseResultElement,
  isParseResultElement,
  hasElementSourceMap,
} from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-parser-adapter-overlay-yaml-1';
import { fileURLToPath } from 'node:url';

import File from '../../../../src/File.ts';
import OverlayYAML1Parser from '../../../../src/parse/parsers/overlay-yaml-1/index.ts';
import { parse } from '../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('parsers', function () {
  context('OverlayYAML1Parser', function () {
    context('canParse', function () {
      context('given file with .yaml extension', function () {
        context('and with proper media type', function () {
          specify('should return true', async function () {
            const file1 = new File({
              uri: '/path/to/overlay.yaml',
              mediaType: mediaTypes.latest('generic'),
            });
            const file2 = new File({
              uri: '/path/to/overlay.yaml',
              mediaType: mediaTypes.latest('yaml'),
            });
            const parser = new OverlayYAML1Parser();

            assert.isTrue(await parser.canParse(file1));
            assert.isTrue(await parser.canParse(file2));
          });
        });

        context('and with improper media type', function () {
          specify('should return false', async function () {
            const file = new File({
              uri: '/path/to/overlay.yaml',
              mediaType: 'application/vnd.aai.asyncapi+yaml;version=2.6.0',
            });
            const parser = new OverlayYAML1Parser();

            assert.isFalse(await parser.canParse(file));
          });
        });
      });

      context('given file with unknown extension', function () {
        specify('should return false', async function () {
          const file = new File({
            uri: '/path/to/overlay.json',
            mediaType: mediaTypes.latest('yaml'),
          });
          const parser = new OverlayYAML1Parser({ fileExtensions: ['.yaml'] });

          assert.isFalse(await parser.canParse(file));
        });
      });

      context('given file with no extension', function () {
        specify('should return false', async function () {
          const file = new File({
            uri: '/path/to/overlay',
            mediaType: mediaTypes.latest('yaml'),
          });
          const parser = new OverlayYAML1Parser({ fileExtensions: ['.yaml'] });

          assert.isFalse(await parser.canParse(file));
        });
      });

      context('given file with supported extension', function () {
        context('and file data is buffer and can be detected as Overlay 1.1.0', function () {
          specify('should return true', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-overlay.yaml');
            const file = new File({
              uri: '/path/to/overlay.yaml',
              data: fs.readFileSync(uri),
            });
            const parser = new OverlayYAML1Parser();

            assert.isTrue(await parser.canParse(file));
          });
        });

        context('and file data is string and can be detected as Overlay 1.1.0', function () {
          specify('should return true', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-overlay.yaml');
            const file = new File({
              uri: '/path/to/overlay.yaml',
              data: fs.readFileSync(uri).toString(),
            });
            const parser = new OverlayYAML1Parser();

            assert.isTrue(await parser.canParse(file));
          });
        });
      });
    });

    context('parse', function () {
      context('given Overlay 1.1.0 YAML data', function () {
        specify('should return parse result', async function () {
          const uri = path.join(__dirname, 'fixtures', 'sample-overlay.yaml');
          const data = fs.readFileSync(uri).toString();
          const file = new File({
            uri,
            data,
            mediaType: mediaTypes.latest('yaml'),
          });
          const parser = new OverlayYAML1Parser();
          const parseResult = await parser.parse(file);

          assert.isTrue(isParseResultElement(parseResult));
        });
      });

      context('given Overlay 1.1.0 YAML data as buffer', function () {
        specify('should return parse result', async function () {
          const uri = path.join(__dirname, 'fixtures', 'sample-overlay.yaml');
          const data = fs.readFileSync(uri);
          const file = new File({
            uri,
            data,
            mediaType: mediaTypes.latest('yaml'),
          });
          const parser = new OverlayYAML1Parser();
          const parseResult = await parser.parse(file);

          assert.isTrue(isParseResultElement(parseResult));
        });
      });

      context('given data that is not Overlay 1.1.0 YAML data', function () {
        specify('should coerce to string and parse', async function () {
          const file = new File({
            uri: '/path/to/file.yaml',
            data: 1 as any,
            mediaType: mediaTypes.latest('yaml'),
          });
          const parser = new OverlayYAML1Parser();
          const parseResult = await parser.parse(file);
          const numberElement = parseResult.get(0) as NumberElement;

          assert.isTrue(isParseResultElement(parseResult));
          assert.isTrue(numberElement.equals(1));
        });
      });

      context('given empty file', function () {
        specify('should return empty parse result', async function () {
          const file = new File({
            uri: '/path/to/file.yaml',
            data: '',
            mediaType: mediaTypes.latest('yaml'),
          });
          const parser = new OverlayYAML1Parser();
          const parseResult = await parser.parse(file);

          assert.isTrue(isParseResultElement(parseResult));
          assert.isTrue(parseResult.isEmpty);
        });
      });

      context('sourceMap', function () {
        context('given sourceMap enabled', function () {
          specify('should decorate ApiDOM with source maps', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-overlay.yaml');
            const data = fs.readFileSync(uri).toString();
            const file = new File({
              uri,
              data,
              mediaType: mediaTypes.latest('yaml'),
            });
            const parser = new OverlayYAML1Parser({ sourceMap: true, strict: false });
            const parseResult = await parser.parse(file);

            assert.isTrue(hasElementSourceMap(parseResult.api!));
          });
        });

        context('given sourceMap disabled', function () {
          specify('should not decorate ApiDOM with source maps', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-overlay.yaml');
            const data = fs.readFileSync(uri).toString();
            const file = new File({
              uri,
              data,
              mediaType: mediaTypes.latest('yaml'),
            });
            const parser = new OverlayYAML1Parser();
            const parseResult = await parser.parse(file);

            assert.isFalse(hasElementSourceMap(parseResult.api!));
          });
        });
      });

      context('extends', function () {
        context('given extends enabled', function () {
          specify('should parse extends target document', async function () {
            const uri = path.join(__dirname, 'fixtures', 'extends', 'overlay.yaml');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'overlay-yaml-1': { extends: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(parseResult));
            assert.strictEqual(parseResult.length, 2);

            const extendsParseResult = parseResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(extendsParseResult));
            assert.isTrue(extendsParseResult.classes.includes('extends'));
          });

          specify('should set retrievalURI metadata on extends result', async function () {
            const uri = path.join(__dirname, 'fixtures', 'extends', 'overlay.yaml');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'overlay-yaml-1': { extends: true },
                },
              },
            });

            const extendsParseResult = parseResult.get(1)! as ParseResultElement;
            const retrievalURI = extendsParseResult.meta.get('retrievalURI');

            assert.isString(retrievalURI);
            assert.include(retrievalURI, 'openapi.yaml');
          });
        });

        context('given extends resolving to the Overlay itself', function () {
          specify('should skip the extends target to prevent cycle', async function () {
            const uri = path.join(__dirname, 'fixtures', 'extends', 'overlay-self-extends.yaml');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'overlay-yaml-1': { extends: true },
                },
              },
            });

            assert.strictEqual(parseResult.length, 2);

            const extendsParseResult = parseResult.get(1)! as ParseResultElement;
            assert.isTrue(extendsParseResult.classes.includes('extends'));
            assert.strictEqual(extendsParseResult.length, 1);

            const annotation = extendsParseResult.get(0)!;
            assert.strictEqual(annotation.element, 'annotation');
            assert.isTrue(annotation.classes.includes('warning'));
            assert.strictEqual(
              annotation.toValue(),
              `Extends target "${uri}" has already been visited. Skipping to prevent cycle`,
            );
          });
        });

        context('given Overlays extending each other', function () {
          specify('should parse the cycle once and skip the repeated target', async function () {
            const uri = path.join(__dirname, 'fixtures', 'extends', 'overlay-cycle-a.yaml');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'overlay-yaml-1': { extends: true },
                },
              },
            });

            assert.strictEqual(parseResult.length, 2);

            // overlay-cycle-a.yaml extends overlay-cycle-b.yaml
            const extendsParseResult = parseResult.get(1)! as ParseResultElement;
            assert.include(extendsParseResult.meta.get('retrievalURI'), 'overlay-cycle-b.yaml');
            assert.strictEqual(extendsParseResult.length, 2);

            // overlay-cycle-b.yaml extends overlay-cycle-a.yaml, which is skipped
            const nestedExtendsParseResult = extendsParseResult.get(1)! as ParseResultElement;
            assert.isTrue(nestedExtendsParseResult.classes.includes('extends'));
            assert.strictEqual(nestedExtendsParseResult.meta.get('retrievalURI'), uri);
            assert.strictEqual(nestedExtendsParseResult.length, 1);
            assert.isTrue(nestedExtendsParseResult.get(0)!.classes.includes('warning'));
          });
        });

        context('given extends disabled', function () {
          specify('should not parse extends target document', async function () {
            const uri = path.join(__dirname, 'fixtures', 'extends', 'overlay.yaml');
            const parseResult = await parse(uri);

            assert.isTrue(isParseResultElement(parseResult));
            assert.strictEqual(parseResult.length, 1);
          });
        });

        context('given overlay without extends field', function () {
          specify('should not produce extends parse result', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-overlay.yaml');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'overlay-yaml-1': { extends: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(parseResult));
            assert.strictEqual(parseResult.length, 1);
          });
        });
      });
    });
  });
});
