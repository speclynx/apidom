import fs from 'node:fs';
import path from 'node:path';
import { assert } from 'chai';
import {
  NumberElement,
  ParseResultElement,
  isParseResultElement,
  hasElementSourceMap,
} from '@speclynx/apidom-datamodel';
import { mediaTypes } from '@speclynx/apidom-parser-adapter-overlay-json-1';
import { fileURLToPath } from 'node:url';

import File from '../../../../src/File.ts';
import OverlayJSON1Parser from '../../../../src/parse/parsers/overlay-json-1/index.ts';
import { parse } from '../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('parsers', function () {
  context('OverlayJSON1Parser', function () {
    context('canParse', function () {
      context('given file with .json extension', function () {
        context('and with proper media type', function () {
          specify('should return true', async function () {
            const file1 = new File({
              uri: '/path/to/overlay.json',
              mediaType: mediaTypes.latest('generic'),
            });
            const file2 = new File({
              uri: '/path/to/overlay.json',
              mediaType: mediaTypes.latest('json'),
            });
            const parser = new OverlayJSON1Parser();

            assert.isTrue(await parser.canParse(file1));
            assert.isTrue(await parser.canParse(file2));
          });
        });

        context('and with improper media type', function () {
          specify('should return false', async function () {
            const file = new File({
              uri: '/path/to/overlay.json',
              mediaType: 'application/vnd.aai.asyncapi+json;version=2.6.0',
            });
            const parser = new OverlayJSON1Parser();

            assert.isFalse(await parser.canParse(file));
          });
        });
      });

      context('given file with unknown extension', function () {
        specify('should return false', async function () {
          const file = new File({
            uri: '/path/to/overlay.yaml',
            mediaType: mediaTypes.latest('json'),
          });
          const parser = new OverlayJSON1Parser({ fileExtensions: ['.json'] });

          assert.isFalse(await parser.canParse(file));
        });
      });

      context('given file with no extension', function () {
        specify('should return false', async function () {
          const file = new File({
            uri: '/path/to/overlay',
            mediaType: mediaTypes.latest('json'),
          });
          const parser = new OverlayJSON1Parser({ fileExtensions: ['.json'] });

          assert.isFalse(await parser.canParse(file));
        });
      });

      context('given file with supported extension', function () {
        context('and file data is buffer and can be detected as Overlay 1.1.0', function () {
          specify('should return true', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-overlay.json');
            const file = new File({
              uri: '/path/to/overlay.json',
              data: fs.readFileSync(uri),
            });
            const parser = new OverlayJSON1Parser();

            assert.isTrue(await parser.canParse(file));
          });
        });

        context('and file data is string and can be detected as Overlay 1.1.0', function () {
          specify('should return true', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-overlay.json');
            const file = new File({
              uri: '/path/to/overlay.json',
              data: fs.readFileSync(uri).toString(),
            });
            const parser = new OverlayJSON1Parser();

            assert.isTrue(await parser.canParse(file));
          });
        });
      });
    });

    context('parse', function () {
      context('given Overlay 1.1.0 JSON data', function () {
        specify('should return parse result', async function () {
          const uri = path.join(__dirname, 'fixtures', 'sample-overlay.json');
          const data = fs.readFileSync(uri).toString();
          const file = new File({
            uri,
            data,
            mediaType: mediaTypes.latest('json'),
          });
          const parser = new OverlayJSON1Parser();
          const parseResult = await parser.parse(file);

          assert.isTrue(isParseResultElement(parseResult));
        });
      });

      context('given Overlay 1.1.0 JSON data as buffer', function () {
        specify('should return parse result', async function () {
          const uri = path.join(__dirname, 'fixtures', 'sample-overlay.json');
          const data = fs.readFileSync(uri);
          const file = new File({
            uri,
            data,
            mediaType: mediaTypes.latest('json'),
          });
          const parser = new OverlayJSON1Parser();
          const parseResult = await parser.parse(file);

          assert.isTrue(isParseResultElement(parseResult));
        });
      });

      context('given data that is not Overlay 1.1.0 JSON data', function () {
        specify('should coerce to string and parse', async function () {
          const file = new File({
            uri: '/path/to/file.json',
            data: 1 as any,
            mediaType: mediaTypes.latest('json'),
          });
          const parser = new OverlayJSON1Parser();
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
          const parser = new OverlayJSON1Parser();
          const parseResult = await parser.parse(file);

          assert.isTrue(isParseResultElement(parseResult));
          assert.isTrue(parseResult.isEmpty);
        });
      });

      context('sourceMap', function () {
        context('given sourceMap enabled', function () {
          specify('should decorate ApiDOM with source maps', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-overlay.json');
            const data = fs.readFileSync(uri).toString();
            const file = new File({
              uri,
              data,
              mediaType: mediaTypes.latest('json'),
            });
            const parser = new OverlayJSON1Parser({ sourceMap: true, strict: false });
            const parseResult = await parser.parse(file);

            assert.isTrue(hasElementSourceMap(parseResult.api!));
          });
        });

        context('given sourceMap disabled', function () {
          specify('should not decorate ApiDOM with source maps', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-overlay.json');
            const data = fs.readFileSync(uri).toString();
            const file = new File({
              uri,
              data,
              mediaType: mediaTypes.latest('json'),
            });
            const parser = new OverlayJSON1Parser();
            const parseResult = await parser.parse(file);

            assert.isFalse(hasElementSourceMap(parseResult.api!));
          });
        });
      });

      context('extends', function () {
        context('given extends enabled', function () {
          specify('should parse extends target document', async function () {
            const uri = path.join(__dirname, 'fixtures', 'extends', 'overlay.json');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'overlay-json-1': { extends: true },
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
            const uri = path.join(__dirname, 'fixtures', 'extends', 'overlay.json');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'overlay-json-1': { extends: true },
                },
              },
            });

            const extendsParseResult = parseResult.get(1)! as ParseResultElement;
            const retrievalURI = extendsParseResult.meta.get('retrievalURI');

            assert.isString(retrievalURI);
            assert.include(retrievalURI, 'openapi.json');
          });
        });

        context('given extends disabled', function () {
          specify('should not parse extends target document', async function () {
            const uri = path.join(__dirname, 'fixtures', 'extends', 'overlay.json');
            const parseResult = await parse(uri);

            assert.isTrue(isParseResultElement(parseResult));
            assert.strictEqual(parseResult.length, 1);
          });
        });

        context('given overlay without extends field', function () {
          specify('should not produce extends parse result', async function () {
            const uri = path.join(__dirname, 'fixtures', 'sample-overlay.json');
            const parseResult = await parse(uri, {
              parse: {
                parserOpts: {
                  'overlay-json-1': { extends: true },
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
