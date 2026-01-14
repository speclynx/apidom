import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, assert } from 'chai';
import { isObjectElement, isParseResultElement } from '@speclynx/apidom-datamodel';
import { sexprs, toJSON } from '@speclynx/apidom-core';

import * as adapter from '../src/adapter.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const spec = fs.readFileSync(path.join(__dirname, 'fixtures', 'sample-data.json')).toString();

describe('adapter', function () {
  context('given valid JSON', function () {
    specify('should detect proper media type', async function () {
      assert.isTrue(await adapter.detect('"string"'));
    });
  });

  context('given non JSON', function () {
    specify('should detect proper media type', async function () {
      assert.isFalse(await adapter.detect('^}'));
    });
  });

  it('should parse', async function () {
    const parseResult = await adapter.parse(spec, {
      sourceMap: true,
    });

    assert.isTrue(isParseResultElement(parseResult));
    assert.isTrue(isObjectElement(parseResult.result));
    expect(sexprs(parseResult)).toMatchSnapshot();
  });

  specify('should parse multi-line JSON string', async function () {
    const json = '"line1\\nline2"';
    const { result } = await adapter.parse(json);

    assert.strictEqual(toJSON(result!), json);
  });

  context('given zero byte empty file', function () {
    specify('should return empty parse result', async function () {
      const parseResult = await adapter.parse('', {
        sourceMap: true,
      });

      assert.isTrue(parseResult.isEmpty);
    });
  });

  context('given non-zero byte empty file', function () {
    specify('should return empty parser result', async function () {
      const parseResult = await adapter.parse('  ', {
        sourceMap: true,
      });

      assert.isTrue(parseResult.isEmpty);
    });
  });

  context('given invalid json string', function () {
    specify('should return empty parser result', async function () {
      const parseResult = await adapter.parse(' a ', {
        sourceMap: true,
      });

      assert.isTrue(parseResult.isEmpty);
    });
  });

  context('given malformed json string', function () {
    specify('should parse', async function () {
      const json = `
        {
          "openapi": "3.0.4",
          "info: {
            "title": "Swagger Petstore - OpenAPI 3.0",
          }
        }`;

      try {
        await adapter.parse(json);
      } catch {
        assert.fail('Parsing unexpectedly threw an error.');
      }
    });
  });

  context('strict mode', function () {
    context('detect', function () {
      specify('should detect valid JSON', async function () {
        assert.isTrue(await adapter.detect('{"key": "value"}', { strict: true }));
      });

      specify('should not detect invalid JSON', async function () {
        assert.isFalse(await adapter.detect('{key: value}', { strict: true }));
      });
    });

    context('parse', function () {
      specify('should parse valid JSON', async function () {
        const parseResult = await adapter.parse(spec, { strict: true });

        assert.isTrue(isParseResultElement(parseResult));
        assert.isTrue(isObjectElement(parseResult.result));
      });

      specify('should throw on invalid JSON', async function () {
        const invalidJson = '{key: value}';

        try {
          await adapter.parse(invalidJson, { strict: true });
          assert.fail('Should have thrown an error');
        } catch (error) {
          assert.instanceOf(error, SyntaxError);
        }
      });

      specify('should throw when strict and sourceMap are both true', async function () {
        try {
          await adapter.parse(spec, { strict: true, sourceMap: true });
          assert.fail('Should have thrown an error');
        } catch (error) {
          assert.instanceOf(error, Error);
          assert.include((error as Error).message, 'Cannot use sourceMap with strict parsing');
        }
      });
    });
  });
});
