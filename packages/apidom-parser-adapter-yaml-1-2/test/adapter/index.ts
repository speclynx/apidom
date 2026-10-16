import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, expect } from 'chai';
import {
  ObjectElement,
  StringElement,
  isObjectElement,
  isParseResultElement,
  isStringElement,
} from '@speclynx/apidom-datamodel';

import YamlTagError from '../../src/tree-sitter/syntactic-analysis/ast/errors/YamlTagError.ts';
import { toValue, sexprs } from '@speclynx/apidom-core';

import * as adapter from '../../src/adapter.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const spec = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'sample-data.yaml')).toString();

describe('adapter', function () {
  context('given valid YAML 1.2', function () {
    specify('should detect proper media type', async function () {
      assert.isTrue(await adapter.detect(spec));
    });
  });

  context('given non YAML 1.2', function () {
    specify('should detect proper media type', async function () {
      assert.isFalse(
        await adapter.detect(`
      !!Invalid yaml:
         "some: key" :
        - "no quotes here: value"
        - list without separator
        another_key: "value" other_key: value
      [no_key]
      :another_invalid_struct!
      `),
      );
    });
  });

  context('given invalid(1) YAML 1.2', function () {
    specify('should detect proper media type', async function () {
      assert.isTrue(
        await adapter.detect(`
        openapi: 3.1.0
        info:
          summary: Update an existing pet
          desc
          title: test title
      `),
      );
    });
  });

  context('given invalid(2) YAML 1.2', function () {
    specify('should detect proper media type', async function () {
      assert.isTrue(
        await adapter.detect(`
        asyncapi: 2.4.0
        info:
          version: '1.0.0'
           title: Something # Badly indented
      `),
      );
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

  context('given zero byte empty file', function () {
    specify('should return empty parse result', async function () {
      const parseResult = await adapter.parse('', { sourceMap: true });

      assert.isTrue(parseResult.isEmpty);
    });
  });

  context('given non-zero byte empty file', function () {
    specify('should return empty parser result', async function () {
      const parseResult = await adapter.parse('  ', { sourceMap: true });

      assert.isTrue(parseResult.isEmpty);
    });
  });

  context('given invalid yaml file', function () {
    specify('should return empty parser result', async function () {
      const parseResult = await adapter.parse(' %YAML x ', { sourceMap: true });

      assert.isTrue(parseResult.isEmpty);
    });
  });

  context('given valid YAML 1.2 with very long mapping key', function () {
    specify('should parse', async function () {
      const parseResult = await adapter.parse(`/${'a'.repeat(256)}: test`);

      assert.isFalse(parseResult.isEmpty);
      expect(toValue(parseResult)).toMatchSnapshot();
    });
  });

  context('given invalid YAML 1.2 with indentation syntax error', function () {
    specify('should produce syntax error annotation', async function () {
      const syntaxErrorSpec = `
        asyncapi: 2.4.0
        info:
          version: '1.0.0'
           title: Something # Badly indented
      `;
      const parseResult = await adapter.parse(syntaxErrorSpec, { sourceMap: true });

      assert.isFalse(parseResult.isEmpty);
      assert.strictEqual(toValue(parseResult.errors.get(0)), '(Error YAML syntax error)');
    });
  });

  context('given invalid YAML 1.2 with missing mapping syntax error', function () {
    specify('should produce syntax error annotation', async function () {
      const syntaxErrorSpec = `
        asyncapi: 2.4.0
        info:
          version: '1.0.0'
          title Something # Missing mapping
      `;
      const parseResult = await adapter.parse(syntaxErrorSpec, { sourceMap: true });

      assert.isTrue(parseResult.isEmpty);
      assert.strictEqual(toValue(parseResult.errors.get(0)), '(Error YAML syntax error)');
    });
  });

  context('given valid YAML 1.2 with unrecognized tag', function () {
    specify('should throw error', async function () {
      const unknownTagSpec = 'prop: !!unknowntag value';

      try {
        await adapter.parse(unknownTagSpec);
        assert.fail('should throw YamlTagError');
        // @ts-ignore
      } catch (error: YamlTagError) {
        assert.instanceOf(error, YamlTagError);
        assert.include(error, {
          specificTagName: 'tag:yaml.org,2002:unknowntag',
          explicitTagName: '!!unknowntag',
          tagKind: 'Scalar',
          nodeCanonicalContent: undefined,
          tagStartLine: 0,
          tagStartCharacter: 6,
          tagStartOffset: 6,
          tagEndLine: 0,
          tagEndCharacter: 18,
          tagEndOffset: 18,
        });
      }
    });
  });

  context('given valid YAML 1.2 with node content failing constraints imposed by tag', function () {
    specify('should throw error', async function () {
      const unknownTagSpec = 'prop: !!int value';

      try {
        await adapter.parse(unknownTagSpec);
        assert.fail('should throw YamlTagError');
        // @ts-ignore
      } catch (error: YamlTagError) {
        assert.instanceOf(error, YamlTagError);
        assert.include(error, {
          specificTagName: 'tag:yaml.org,2002:int',
          explicitTagName: '!!int',
          tagKind: 'Scalar',
          nodeCanonicalContent: 'value',
          tagStartLine: 0,
          tagStartCharacter: 6,
          tagStartOffset: 6,
          tagEndLine: 0,
          tagEndCharacter: 11,
          tagEndOffset: 11,
        });
      }
    });
  });

  context('given an alias', function () {
    specify('should analyze alias as string', async function () {
      const result = await adapter.parse('*alias');
      assert.isTrue(isStringElement(result.result));
    });
  });

  context('given single-quote scalar containing only space characters', function () {
    specify('should parse all space characters', async function () {
      const result = await adapter.parse("' '");
      const expected = toValue(result) as string[];
      assert.strictEqual(expected[0], ' ');
    });
  });

  context('given double-quote scalar containing only space characters', function () {
    specify('should parse all space characters', async function () {
      const result = await adapter.parse('" "');
      const expected = toValue(result) as string[];
      assert.strictEqual(expected[0], ' ');
    });
  });

  // https://github.com/speclynx/apidom/issues/610
  context('given block scalar with indentation indicator before chomping indicator', function () {
    specify('should apply both indicators to literal style', async function () {
      const result = await adapter.parse('d: |2-\n  Line one.\n  Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\nLine two.');
    });

    specify('should apply both indicators with leading empty line', async function () {
      const result = await adapter.parse('d: |2-\n\n  Line one.\n\n  Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\nLine one.\n\nLine two.');
    });

    specify('should apply both indicators to folded style', async function () {
      const result = await adapter.parse('d: >2-\n  Line one.\n  Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one. Line two.');
    });

    specify('should apply keep chomping indicator', async function () {
      const result = await adapter.parse('d: >2+\n  Line one.\n  Line two.\n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one. Line two.\n\n');
    });

    specify('should apply both indicators when followed by a comment', async function () {
      const result = await adapter.parse('d: |2- # comment\n  Line one.\n  Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\nLine two.');
    });

    specify('should still apply indicators in chomping-first order', async function () {
      const result = await adapter.parse('d: |-2\n\n  Line one.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\nLine one.');
    });
  });

  context('given folded block scalar with leading empty lines', function () {
    specify('should preserve single leading empty line', async function () {
      const result = await adapter.parse('d: >2-\n\n  Line one.\n  Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\nLine one. Line two.');
    });

    specify('should preserve multiple leading empty lines', async function () {
      const result = await adapter.parse('d: >2\n\n\n  Line one.\n  Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\n\nLine one. Line two.\n');
    });

    specify('should fold content lines after leading empty line', async function () {
      const result = await adapter.parse('d: >2\n\n  Line one.\n\n  Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\nLine one.\nLine two.\n');
    });

    specify('should not change keep chomping of empty-only content', async function () {
      const result = await adapter.parse('d: >2+\n\n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\n\n');
    });
  });

  context('given block scalar without indentation indicator and leading empty lines', function () {
    specify('should detect indentation in literal style', async function () {
      const result = await adapter.parse('d: |\n\n\n  Line one.\n  Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\n\nLine one.\nLine two.\n');
    });

    specify('should detect indentation in folded style', async function () {
      const result = await adapter.parse('d: >-\n\n  Line one.\n  Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\nLine one. Line two.');
    });

    specify('should skip whitespace-only leading lines', async function () {
      const result = await adapter.parse('d: |\n \n  Line one.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\nLine one.\n');
    });

    specify('should skip leading empty lines with CRLF line breaks', async function () {
      const result = await adapter.parse('d: |\r\n\r\n  Line one.\r\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\nLine one.\n');
    });

    specify('should strip spaces of whitespace-only content', async function () {
      const result = await adapter.parse('d: >+\n   \n  \n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\n\n');
    });
  });

  // https://github.com/speclynx/apidom/issues/613
  context('given empty block scalar', function () {
    specify('should parse literal style as empty string', async function () {
      const result = await adapter.parse('d: |\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '');
    });

    specify('should parse folded style with empty lines as empty string', async function () {
      const result = await adapter.parse('d: >\n\n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '');
    });

    specify('should parse as empty string when followed by another key', async function () {
      const result = await adapter.parse('d: |-\nb: 1\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '');
    });

    specify('should parse as empty string at end of input', async function () {
      const result = await adapter.parse('d: |2-');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '');
    });

    specify('should parse as empty string when header has comment', async function () {
      const result = await adapter.parse('d: | # comment\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '');
    });

    specify('should parse clip as empty string when followed by another key', async function () {
      const result = await adapter.parse('d: |\nb: 1\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '');
    });

    specify('should parse whitespace-only content as empty string', async function () {
      const result = await adapter.parse('d: |\n  \n  \n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '');
    });

    specify('should parse sequence items as empty strings', async function () {
      const result = await adapter.parse('- |\n- >\n');
      assert.deepEqual(toValue(result.result), ['', '']);
    });
  });

  // https://github.com/speclynx/apidom/issues/612
  context('given block scalar with keep chomping at end of document', function () {
    specify('should keep single final line break in literal style', async function () {
      const result = await adapter.parse('d: |+\n  Line one.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n');
    });

    specify('should keep trailing empty lines in literal style', async function () {
      const result = await adapter.parse('d: |+\n  Line one.\n\n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n\n\n');
    });

    specify('should keep trailing empty lines in folded style', async function () {
      const result = await adapter.parse('d: >+\n  Line one.\n  Line two.\n\n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one. Line two.\n\n\n');
    });

    specify('should parse empty content as empty string', async function () {
      const result = await adapter.parse('d: |+\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '');
    });

    specify('should keep empty lines of empty-only content', async function () {
      const result = await adapter.parse('d: |+\n\n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\n\n');
    });

    specify('should keep trailing empty lines with CRLF line breaks', async function () {
      const result = await adapter.parse('d: |+\r\n  Line one.\r\n\r\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n\n');
    });

    specify('should keep single final line break in folded style', async function () {
      const result = await adapter.parse('d: >+\n  Line one.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n');
    });

    specify('should fold around empty line in folded style', async function () {
      const result = await adapter.parse('d: >+\n  Line one.\n\n  Line two.\n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\nLine two.\n\n');
    });

    specify('should keep trailing empty lines of sequence item', async function () {
      const result = await adapter.parse('- |+\n  Line one.\n\n');
      assert.deepEqual(toValue(result.result), ['Line one.\n\n']);
    });

    specify('should not change strip chomping in folded style', async function () {
      const result = await adapter.parse('d: >-\n  Line one.\n  Line two.\n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one. Line two.');
    });

    specify('should not change clip chomping in folded style', async function () {
      const result = await adapter.parse('d: >\n  Line one.\n  Line two.\n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one. Line two.\n');
    });
  });

  // https://github.com/speclynx/apidom/issues/612
  context('given block scalar with keep chomping followed by another node', function () {
    specify('should keep trailing empty lines before next key', async function () {
      const result = await adapter.parse('d: |+\n  Line one.\n\n\nb: 1\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n\n\n');
    });

    specify('should keep trailing empty lines before next key in folded style', async function () {
      const result = await adapter.parse('d: >+\n  Line one.\n  Line two.\n\nb: 1\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one. Line two.\n\n');
    });

    specify('should keep trailing empty lines before next sequence item', async function () {
      const result = await adapter.parse('- |+\n  Line one.\n\n- 1\n');
      assert.deepEqual(toValue(result.result), ['Line one.\n\n', 1]);
    });

    specify('should keep trailing empty lines before comment', async function () {
      const result = await adapter.parse('d: |+\n  Line one.\n\n# comment\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n\n');
    });

    specify('should keep trailing empty lines with CRLF line breaks', async function () {
      const result = await adapter.parse('d: |+\r\n  Line one.\r\n\r\n\r\nb: 1\r\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n\n\n');
    });

    specify('should not keep line breaks without trailing empty lines', async function () {
      const result = await adapter.parse('d: |+\n  Line one.\nb: 1\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n');
    });

    specify('should not change clip chomping before next key', async function () {
      const result = await adapter.parse('d: |\n  Line one.\n\n\nb: 1\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n');
    });

    specify('should not change source map of block scalar', async function () {
      const result = await adapter.parse('d: |+\n  Line one.\n\nb: 1\n', { sourceMap: true });
      const d = (result.result as ObjectElement).get('d') as StringElement;
      assert.strictEqual(d.endOffset, 17);
    });

    specify('should keep trailing empty lines of last nested value', async function () {
      const result = await adapter.parse('a:\n  d: |+\n    Line one.\n\nb: 1\n');
      assert.deepEqual(toValue(result.result), { a: { d: 'Line one.\n\n' }, b: 1 });
    });

    specify('should keep trailing empty lines in sequence item mapping', async function () {
      const result = await adapter.parse('- a: |+\n    Line one.\n\n  b: 1\n- 2\n');
      assert.deepEqual(toValue(result.result), [{ a: 'Line one.\n\n', b: 1 }, 2]);
    });

    specify('should keep trailing empty lines before document end marker', async function () {
      const result = await adapter.parse('d: |+\n  Line one.\n\n...\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n\n');
    });

    specify('should not keep empty lines after comment', async function () {
      const result = await adapter.parse('d: |+\n  Line one.\n\n# comment\n\nb: 1\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n\n');
    });
  });

  // https://github.com/speclynx/apidom/issues/567
  context('given block scalar with more-indented lines', function () {
    specify('should keep extra indentation in literal style', async function () {
      const result = await adapter.parse(
        'd: |\n  Literal block\n    * indented item\n  Last line.\n',
      );
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Literal block\n  * indented item\nLast line.\n');
    });

    specify('should keep extra indentation with explicit indentation indicator', async function () {
      const result = await adapter.parse('d: |4-\n    Line one.\n      Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n  Line two.');
    });
  });

  // https://github.com/speclynx/apidom/issues/610
  context('given block scalar with explicit indentation indicator', function () {
    specify('should apply indicator relative to mapping key', async function () {
      const result = await adapter.parse('a:\n  d: |1\n     Line one.\n');
      assert.deepEqual(toValue(result.result), { a: { d: '  Line one.\n' } });
    });

    specify('should apply indicator relative to key followed by another key', async function () {
      const result = await adapter.parse('a:\n  d: |1\n     Line one.\n  e: 1\n');
      assert.deepEqual(toValue(result.result), { a: { d: '  Line one.\n', e: 1 } });
    });

    specify('should apply indicator relative to key with anchor and tag', async function () {
      const result = await adapter.parse('a:\n  d: &x !!str |2\n      Line one.\n');
      assert.deepEqual(toValue(result.result), { a: { d: '  Line one.\n' } });
    });

    specify('should apply indicator in folded style', async function () {
      const result = await adapter.parse('d: >1\n   Line one.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '  Line one.\n');
    });

    specify('should apply indicator relative to sequence item', async function () {
      const result = await adapter.parse('- |1\n   Line one.\n');
      assert.deepEqual(toValue(result.result), ['  Line one.\n']);
    });

    specify('should apply indicator relative to explicit key', async function () {
      const result = await adapter.parse('? |1\n   Line one.\n: v\n');
      assert.deepEqual(toValue(result.result), { '  Line one.\n': 'v' });
    });

    specify('should apply indicator at top level', async function () {
      const result = await adapter.parse('|1\n  Line one.\n');
      assert.strictEqual(toValue(result.result), ' Line one.\n');
    });
  });

  // https://github.com/speclynx/apidom/issues/567
  context('given folded block scalar with more-indented lines', function () {
    specify('should not fold line breaks around more-indented lines', async function () {
      const result = await adapter.parse(
        'd: >-\n  Typically printed\n    * Routing number\n    * Account number\n  This is sensitive\n',
      );
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(
        d,
        'Typically printed\n  * Routing number\n  * Account number\nThis is sensitive',
      );
    });

    specify('should keep empty lines around more-indented line', async function () {
      const result = await adapter.parse(
        'd: >\n  Line one.\n\n    More indented.\n\n  Line two.\n',
      );
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n\n  More indented.\n\nLine two.\n');
    });

    specify('should fold lines before more-indented line', async function () {
      const result = await adapter.parse('d: >\n  Line one.\n  Line two.\n    More indented.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one. Line two.\n  More indented.\n');
    });

    specify('should keep more-indented first line', async function () {
      const result = await adapter.parse('d: >2\n   More indented.\n  Line one.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, ' More indented.\nLine one.\n');
    });

    specify('should turn empty lines between lines into line breaks', async function () {
      const result = await adapter.parse('d: >\n  Line one.\n  Line two.\n\n\n  Line three.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one. Line two.\n\nLine three.\n');
    });
  });

  // https://github.com/tree-sitter-grammars/tree-sitter-yaml/pull/35
  context('given YAML 1.2 with more than 32768 lines', function () {
    specify('should parse', async function () {
      this.timeout(10000);

      const lines = ['root:'];
      for (let i = 0; i < 33000; i += 1) {
        lines.push(`  key${i}: value${i}`);
      }
      const yaml = lines.join('\n');
      const parseResult = await adapter.parse(yaml);
      const root = (parseResult.result as ObjectElement).get('root') as ObjectElement;

      assert.isTrue(isParseResultElement(parseResult));
      assert.isTrue(isObjectElement(parseResult.result));
      assert.strictEqual(root.length, 33000);
    });
  });

  context('strict mode', function () {
    context('detect', function () {
      specify('should detect valid YAML', async function () {
        assert.isTrue(await adapter.detect('key: value', { strict: true }));
      });

      specify('should detect valid YAML object', async function () {
        assert.isTrue(await adapter.detect(spec, { strict: true }));
      });

      specify('should not detect invalid YAML', async function () {
        assert.isFalse(await adapter.detect('key: value: invalid', { strict: true }));
      });
    });

    context('parse', function () {
      specify('should parse valid YAML', async function () {
        const parseResult = await adapter.parse(spec, { strict: true });

        assert.isTrue(isParseResultElement(parseResult));
        assert.isTrue(isObjectElement(parseResult.result));
      });

      specify('should parse simple key-value', async function () {
        const parseResult = await adapter.parse('key: value', { strict: true });

        assert.isTrue(isParseResultElement(parseResult));
        assert.isTrue(isObjectElement(parseResult.result));
        assert.deepEqual(toValue(parseResult.result), { key: 'value' });
      });

      specify('should throw on invalid YAML', async function () {
        const invalidYaml = 'key: value: invalid';

        try {
          await adapter.parse(invalidYaml, { strict: true });
          assert.fail('Should have thrown an error');
        } catch (error) {
          assert.instanceOf(error, Error);
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
