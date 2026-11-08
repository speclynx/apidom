import { Buffer } from 'node:buffer';
import path from 'node:path';
import { assert } from 'chai';
import { isParseResultElement, hasElementSourceMap } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';
import { fileURLToPath } from 'node:url';

import defaultOptions from '../../src/options/index.ts';
import { merge as mergeOptions } from '../../src/options/util.ts';
import parse from '../../src/parse/index.ts';
import ParseError from '../../src/errors/ParseError.ts';
import ResolveError from '../../src/errors/ResolveError.ts';
import UnmatchedParserError from '../../src/errors/UnmatchedParserError.ts';
import OpenAPIJSON3_1Parser from '../../src/parse/parsers/openapi-json-3-1/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('parse', function () {
  context('given URI with hash', function () {
    specify('should read & parse the file', async function () {
      const uri = path.join(__dirname, 'fixtures', 'sample-openapi-3-1-api.json#hash');
      const options = mergeOptions(defaultOptions, {
        parse: { mediaType: mediaTypes.latest('json') },
      });
      const parseResult = await parse(uri, options);

      assert.isTrue(isParseResultElement(parseResult));
    });
  });

  context('given parserOpts as provided', function () {
    specify('should respect parserOpts during parsing; sourceMap = on', async function () {
      const uri = path.join(__dirname, 'fixtures', 'sample-openapi-3-1-api.json#hash');
      const options = mergeOptions(defaultOptions, {
        parse: {
          mediaType: mediaTypes.latest('json'),
          parserOpts: { sourceMap: true, strict: false },
        },
      });
      const parseResult = await parse(uri, options);
      const { api } = parseResult;

      assert.isTrue(hasElementSourceMap(api!));
    });

    specify('should respect parserOpts during parsing; sourceMap = off', async function () {
      const uri = path.join(__dirname, 'fixtures', 'sample-openapi-3-1-api.json#hash');
      const options = mergeOptions(defaultOptions, {
        parse: {
          mediaType: mediaTypes.latest('json'),
          parserOpts: { sourceMap: false },
        },
      });
      const parseResult = await parse(uri, options);
      const { api } = parseResult;

      assert.isFalse(hasElementSourceMap(api!));
    });
  });

  context('given URI with unknown file extension', function () {
    context('and matching binary parser', function () {
      specify('should read & parse the file', async function () {
        const uri = path.join(__dirname, 'fixtures', 'unknown-extension.ext');
        const parseResult = await parse(uri, defaultOptions);
        const { result } = parseResult;
        const actual = Buffer.from(toValue(result) as string, 'base64').toString('utf8');

        assert.strictEqual(actual, 'possibly binary content\n');
      });
    });
  });

  context('given URI with no matching parser', function () {
    specify('should throw error', async function () {
      const uri = path.join(__dirname, 'fixtures', 'unknown-extension.ext');
      const options = mergeOptions(defaultOptions, {
        parse: {
          parsers: [],
        },
      });

      try {
        await parse(uri, options);
        assert.fail('Should throw UnmatchedParserError');
      } catch (error) {
        assert.instanceOf(error, UnmatchedParserError);
      }
    });
  });

  context('given URI with non existing file', function () {
    specify('should throw error', async function () {
      const uri = '/path/to/non-existing-file.json';
      const options = mergeOptions(defaultOptions, {
        parse: { mediaType: mediaTypes.latest('json') },
      });

      try {
        await parse(uri, options);
        assert.fail('Should throw ResolveError');
      } catch (error) {
        assert.instanceOf(error, ResolveError);
      }
    });
  });

  context("given suitable parser doesn't allow empty files", function () {
    specify('should throw error', async function () {
      const uri = path.join(__dirname, 'fixtures', 'empty-openapi-3-1-api.json');
      const options = mergeOptions(defaultOptions, {
        parse: {
          mediaType: mediaTypes.latest('json'),
          parsers: [new OpenAPIJSON3_1Parser({ allowEmpty: false })],
        },
      });

      try {
        await parse(uri, options);
        assert.fail('Should throw ParserError');
      } catch (error: any) {
        assert.instanceOf(error, ParseError);
        assert.match(error.message, /file is empty$/);
      }
    });
  });

  context('given parser plugin throws error', function () {
    const parser = {
      allowEmpty: true,
      sourceMaps: false,
      canParse() {
        return true;
      },
      parse() {
        throw Error('I will not parse anything!');
      },
    };

    specify('should throw error', async function () {
      const uri = path.join(__dirname, 'fixtures', 'sample-openapi-3-1-api.json');
      const options = mergeOptions(defaultOptions, {
        parse: {
          mediaType: mediaTypes.latest('json'),
          parsers: [parser],
        },
      });

      try {
        await parse(uri, options);
        assert.fail('Should throw ParseError');
      } catch (error) {
        assert.instanceOf(error, ParseError);
      }
    });
  });

  context('given a media type listed by a parser', function () {
    // detection of an earlier configured parser (OpenAPI YAML 3.0) matches this OpenAPI 3.1 document
    const uri = path.join(__dirname, 'fixtures', 'openapi-3-1-with-3-0-text.yaml');

    specify('should parse with that parser before the detecting ones', async function () {
      const options = mergeOptions(defaultOptions, {
        parse: { mediaType: 'application/openapi+yaml;version=3.1.2' },
      });
      const parseResult = await parse(uri, options);

      assert.strictEqual(parseResult.api?.element, 'openApi3_1');
    });

    specify('should ignore whitespace around the media type', async function () {
      const options = mergeOptions(defaultOptions, {
        parse: { mediaType: ' application/openapi+yaml;version=3.1.2\t' },
      });
      const parseResult = await parse(uri, options);

      assert.strictEqual(parseResult.api?.element, 'openApi3_1');
    });

    specify('should compare media types per RFC 9110', async function () {
      const options = mergeOptions(defaultOptions, {
        parse: { mediaType: 'Application/OpenAPI+YAML; Version=3.1.2; charset=utf-8' },
      });
      const parseResult = await parse(uri, options);

      assert.strictEqual(parseResult.api?.element, 'openApi3_1');
    });
  });

  context('given a JSON media type', function () {
    // the JSON parser lists it, but the configured order puts the OpenAPI parsers first
    const uri = path.join(__dirname, 'fixtures', 'sample-openapi-3-1-api.json');

    ['application/json', 'application/json; charset=utf-8'].forEach((jsonMediaType) => {
      specify(
        `should parse ${jsonMediaType} with the parser detecting the file`,
        async function () {
          const options = mergeOptions(defaultOptions, { parse: { mediaType: jsonMediaType } });
          const parseResult = await parse(uri, options);

          assert.strictEqual(parseResult.api?.element, 'openApi3_1');
        },
      );
    });
  });

  context('given a media type that is not a string', function () {
    specify('should parse with the parser detecting the file', async function () {
      const uri = path.join(__dirname, 'fixtures', 'sample-openapi-3-1-api.json');
      const options = mergeOptions(defaultOptions, {
        parse: { mediaType: null as unknown as string },
      });
      const parseResult = await parse(uri, options);

      assert.strictEqual(parseResult.api?.element, 'openApi3_1');
    });
  });

  context('given a media type of a parser that fails', function () {
    specify('should fall back to the parsers detecting the file', async function () {
      const uri = path.join(__dirname, 'fixtures', 'sample-openapi-3-1-api.json');
      const options = mergeOptions(defaultOptions, {
        parse: { mediaType: 'application/vnd.apidom' },
      });
      const parseResult = await parse(uri, options);

      assert.strictEqual(parseResult.api?.element, 'openApi3_1');
    });
  });
});
