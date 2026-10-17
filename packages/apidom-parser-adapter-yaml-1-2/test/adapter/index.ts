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
import { toValue, toYAML, sexprs } from '@speclynx/apidom-core';

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

  // https://github.com/speclynx/apidom/issues/617
  context('given an alias', function () {
    specify('should analyze alias as string', async function () {
      const result = await adapter.parse('*alias');
      assert.isTrue(isStringElement(result.result));
      assert.strictEqual(toValue(result.result), '*alias');
    });

    specify('should analyze alias as mapping value', async function () {
      const result = await adapter.parse('d: &a x\ne: *a\n');
      assert.deepEqual(toValue(result.result), { d: 'x', e: '*a' });
    });

    specify('should analyze alias as sequence item', async function () {
      const result = await adapter.parse('- *a\n- 1\n');
      assert.deepEqual(toValue(result.result), ['*a', 1]);
    });

    specify('should analyze alias in flow mapping', async function () {
      const result = await adapter.parse('{a: *x}\n');
      assert.deepEqual(toValue(result.result), { a: '*x' });
    });

    specify('should generate source map for alias', async function () {
      const result = await adapter.parse('d: &a x\ne: *a\n', { sourceMap: true });
      const e = (result.result as ObjectElement).get('e') as StringElement;
      assert.strictEqual(e.startOffset, 11);
      assert.strictEqual(e.endOffset, 13);
    });
  });

  context('given single-quote scalar containing only space characters', function () {
    specify('should parse all space characters', async function () {
      const result = await adapter.parse("' '");
      const expected = toValue(result) as string[];
      assert.strictEqual(expected[0], ' ');
    });
  });

  // https://github.com/speclynx/apidom/issues/625
  context('given single-quote scalar with escaped single quotes', function () {
    specify('should unescape single quote', async function () {
      const result = await adapter.parse("title: 'The user''s phone number'\n");
      const { title } = toValue(result.result) as { title: string };
      assert.strictEqual(title, "The user's phone number");
    });

    specify('should unescape every escaped single quote', async function () {
      const result = await adapter.parse("a: '''x'''''\n");
      const { a } = toValue(result.result) as { a: string };
      assert.strictEqual(a, "'x''");
    });

    specify('should unescape single quote in multi-line scalar', async function () {
      const result = await adapter.parse("a: 'it''s\n  two lines'\n");
      const { a } = toValue(result.result) as { a: string };
      assert.strictEqual(a, "it's two lines");
    });

    specify('should unescape single quote in mapping key', async function () {
      const result = await adapter.parse("'it''s': v\n");
      assert.deepEqual(toValue(result.result), { "it's": 'v' });
    });

    specify('should serialize back without doubling escapes', async function () {
      const result = await adapter.parse("title: 'The user''s phone number'\n", { style: true });
      const yaml = toYAML(result.result!, { preserveStyle: true });
      assert.strictEqual(yaml, "title: 'The user''s phone number'\n");
    });
  });

  // https://github.com/speclynx/apidom/issues/631
  context('given empty node serialized back with preserveStyle', function () {
    specify('should write it back empty', async function () {
      const result = await adapter.parse('a:\nb:   \nc:\n  - \n', { style: true });
      const yaml = toYAML(result.result!, { preserveStyle: true });
      assert.strictEqual(yaml, 'a:\nb:\nc:\n  - \n');
    });

    specify('should write it back empty after its tag', async function () {
      const source = 'a: !!null\nb: !!str\nc: !\nd:\n  - !!str\n';
      const result = await adapter.parse(source, { style: true });
      const yaml = toYAML(result.result!, { preserveStyle: true });
      assert.strictEqual(yaml, source);
    });
  });

  // https://github.com/speclynx/apidom/issues/639
  context('given explicit tag serialized back with preserveStyle', function () {
    specify('should write tags of scalars and collections back', async function () {
      const source = 'a: !!int 1\nb: !!map {c: 1}\nd: !!seq\n  - 1\n';
      const result = await adapter.parse(source, { style: true });
      const yaml = toYAML(result.result!, { preserveStyle: true });
      assert.strictEqual(yaml, source);
    });

    specify('should write str tag back without quoting value', async function () {
      const source = 'a: !!str 1\nb: ! true\nc: !<tag:yaml.org,2002:str> null\n';
      const result = await adapter.parse(source, { style: true });
      const yaml = toYAML(result.result!, { preserveStyle: true });
      assert.strictEqual(yaml, source);
    });

    specify('should keep flow sequence with tagged first item unpadded', async function () {
      const source = 'a: [!!str 1, b]\nc: [!!str]\n';
      const result = await adapter.parse(source, { style: true });
      const yaml = toYAML(result.result!, { preserveStyle: true });
      assert.strictEqual(yaml, source);
    });

    specify('should keep flow sequence with tagged first item padded', async function () {
      const source = 'a: [ !!str 1, b ]\nc: [ !!str ]\n';
      const result = await adapter.parse(source, { style: true });
      const yaml = toYAML(result.result!, { preserveStyle: true });
      assert.strictEqual(yaml, source);
    });

    specify('should keep space between tag of empty key and colon', async function () {
      const source = '!!str : a\nb: {!!str : 1}\n';
      const result = await adapter.parse(source, { style: true });
      const yaml = toYAML(result.result!, { preserveStyle: true });
      assert.strictEqual(yaml, source);
    });

    specify('should not write non-specific tag of quoted scalar', async function () {
      const result = await adapter.parse('a: ! "1"\n', { style: true });
      const yaml = toYAML(result.result!, { preserveStyle: true });
      assert.strictEqual(yaml, 'a: "1"\n');
    });
  });

  context('given double-quote scalar containing only space characters', function () {
    specify('should parse all space characters', async function () {
      const result = await adapter.parse('" "');
      const expected = toValue(result) as string[];
      assert.strictEqual(expected[0], ' ');
    });
  });

  // https://github.com/speclynx/apidom/issues/628
  context('given multi-line flow scalar', function () {
    specify('should turn whitespace-only line into line break', async function () {
      const result = await adapter.parse('k: Line one.\n  \n  Line two.\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, 'Line one.\nLine two.');
    });

    specify('should drop trailing space before line break', async function () {
      const result = await adapter.parse('k: Line one. \n  Line two.\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, 'Line one. Line two.');
    });

    specify('should keep empty line after whitespace-only line', async function () {
      const result = await adapter.parse('k: Line one.\n  \n\n  Line two.\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, 'Line one.\n\nLine two.');
    });

    specify('should drop trailing tab in single-quoted style', async function () {
      const result = await adapter.parse("k: 'Line one.\t\n  Line two.'\n");
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, 'Line one. Line two.');
    });

    specify('should keep escaped space before line break', async function () {
      const result = await adapter.parse('k: "Line one.\\ \n  Line two."\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, 'Line one.  Line two.');
    });

    specify('should keep escaped tab after escaped line feed', async function () {
      const result = await adapter.parse('k: "\\n\\tLine one."\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, '\n\tLine one.');
    });

    specify('should join lines at escaped line break', async function () {
      const result = await adapter.parse('k: "Line one.\\\n    Line two."\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, 'Line one.Line two.');
    });

    specify('should fold empty line after escaped line break', async function () {
      const result = await adapter.parse('k: "Line one.\\\n\n  Line two."\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, 'Line one. Line two.');
    });

    specify('should not treat escaped backslash as escaped line break', async function () {
      const result = await adapter.parse('k: "Line one.\\\\\n  Line two."\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, 'Line one.\\ Line two.');
    });

    specify('should fold long white space run in linear time', async function () {
      const result = await adapter.parse(`k: "a${' '.repeat(200000)}b"\n`);
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k.length, 200002);
    });

    specify('should fold scalars in flow sequence', async function () {
      const result = await adapter.parse(
        'k: [Line one. \n  Line two., "Line three. \n  Line four."]\n',
      );
      assert.deepEqual(toValue(result.result), {
        k: ['Line one. Line two.', 'Line three. Line four.'],
      });
    });

    specify('should fold scalar in flow mapping', async function () {
      const result = await adapter.parse("{k: 'Line one.\n\n  Line two.'}\n");
      assert.deepEqual(toValue(result.result), { k: 'Line one.\nLine two.' });
    });

    specify('should fold explicit key', async function () {
      const result = await adapter.parse('? "Line one. \n  Line two."\n: v\n');
      assert.deepEqual(toValue(result.result), { 'Line one. Line two.': 'v' });
    });

    specify('should fold sequence item', async function () {
      const result = await adapter.parse('- Line one. \n  Line two.\n');
      assert.deepEqual(toValue(result.result), ['Line one. Line two.']);
    });

    specify('should fold with CRLF line breaks', async function () {
      const result = await adapter.parse('k: "Line one. \r\n  \r\n  Line two."\r\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, 'Line one.\nLine two.');
    });

    specify('should fold around hex and unicode escapes', async function () {
      const result = await adapter.parse('k: "\\x41 \n  \\u00e9"\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, 'A é');
    });
  });

  // https://github.com/speclynx/apidom/issues/635
  context('given double-quoted escape sequences', function () {
    specify('should decode YAML-only escapes', async function () {
      const result = await adapter.parse('k: "\\a\\e\\N\\_\\L\\P"\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, '\x07\x1b\u0085\u00a0\u2028\u2029');
    });

    specify('should decode 8-digit unicode escape', async function () {
      const result = await adapter.parse('k: "\\U0001F600"\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, '😀');
    });

    specify('should decode escapes shared with JavaScript', async function () {
      const result = await adapter.parse(
        'k: "\\0\\b\\t\\n\\v\\f\\r\\ \\"\\/\\\\\\x41\\u00e9\\uD83D\\uDE00"\n',
      );
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, '\0\b\t\n\v\f\r "/\\Aé😀');
    });

    specify('should decode escaped tab', async function () {
      const result = await adapter.parse('k: "a\\\tb"\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, 'a\tb');
    });

    specify('should decode null escape followed by digit', async function () {
      const result = await adapter.parse('k: "\\01"\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, '\x001');
    });

    specify('should not decode escape after escaped backslash', async function () {
      const result = await adapter.parse('k: "\\\\n\\\\U0001F600\\\\\\x41"\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, '\\n\\U0001F600\\A');
    });

    specify('should decode escapes next to folded and escaped line breaks', async function () {
      const result = await adapter.parse('k: "\\e\n  \\N\\\n  \\_\n\n  \\L"\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, '\x1b \u0085\u00a0\n\u2028');
    });

    specify('should keep out of range unicode escape', async function () {
      const result = await adapter.parse('k: "\\U00110000"\n');
      const { k } = toValue(result.result) as { k: string };
      assert.strictEqual(k, '\\U00110000');
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

  // https://github.com/speclynx/apidom/issues/629
  context('given block scalar with trailing white space followed by another node', function () {
    specify('should keep trailing spaces of last line before next key', async function () {
      const result = await adapter.parse('d: |\n  a  \nz: 1\n');
      assert.deepEqual(toValue(result.result), { d: 'a  \n', z: 1 });
    });

    specify('should keep trailing spaces of last line with strip chomping', async function () {
      const result = await adapter.parse('d: |-\n  a  \nz: 1\n');
      assert.deepEqual(toValue(result.result), { d: 'a  ', z: 1 });
    });

    specify('should keep whitespace-only line indented deeper than block', async function () {
      const result = await adapter.parse('d: |\n  a\n   \nz: 1\n');
      assert.deepEqual(toValue(result.result), { d: 'a\n \n', z: 1 });
    });

    specify('should keep whitespace-only line with keep chomping', async function () {
      const result = await adapter.parse('d: |+\n  a\n   \nz: 1\n');
      assert.deepEqual(toValue(result.result), { d: 'a\n \n', z: 1 });
    });

    specify('should keep trailing spaces before next sequence item', async function () {
      const result = await adapter.parse('- |\n  a  \n- b\n');
      assert.deepEqual(toValue(result.result), ['a  \n', 'b']);
    });

    specify('should keep trailing spaces of nested value', async function () {
      const result = await adapter.parse('x:\n  d: |+\n    a  \n     \n  z: 1\n');
      assert.deepEqual(toValue(result.result), { x: { d: 'a  \n \n', z: 1 } });
    });

    specify('should keep trailing spaces with CRLF line breaks', async function () {
      const result = await adapter.parse('d: |\r\n  a  \r\nz: 1\r\n');
      assert.deepEqual(toValue(result.result), { d: 'a  \n', z: 1 });
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

    specify('should not fold line breaks around tab started line', async function () {
      const result = await adapter.parse('d: >\n  Line one.\n  \tTab started.\n  Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n\tTab started.\nLine two.\n');
    });

    specify('should not fold line breaks between more-indented lines', async function () {
      const result = await adapter.parse(
        'd: >\n  Line one.\n    More one.\n    More two.\n  Line two.\n',
      );
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n  More one.\n  More two.\nLine two.\n');
    });

    specify('should keep all empty lines around more-indented line', async function () {
      const result = await adapter.parse(
        'd: >\n  Line one.\n\n\n    More indented.\n\n\n  Line two.\n',
      );
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n\n\n  More indented.\n\n\nLine two.\n');
    });

    specify('should keep more-indented last line with keep chomping', async function () {
      const result = await adapter.parse('d: >+\n  Line one.\n    More indented.\n\n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n  More indented.\n\n\n');
    });

    specify('should keep more-indented last line with strip chomping', async function () {
      const result = await adapter.parse('d: >-\n  Line one.\n    More indented.\n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n  More indented.');
    });

    specify('should not fold line breaks around more-indented line with CRLF', async function () {
      const result = await adapter.parse(
        'd: >\r\n  Line one.\r\n    More indented.\r\n  Line two.\r\n',
      );
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n  More indented.\nLine two.\n');
    });
  });

  // https://github.com/speclynx/apidom/issues/618
  context('given block scalar with trailing whitespace', function () {
    specify('should keep trailing spaces with clip chomping', async function () {
      const result = await adapter.parse('d: |\n  Line one.  \n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.  \n');
    });

    specify('should keep trailing tab with strip chomping', async function () {
      const result = await adapter.parse('d: |-\n  Line one.\t\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\t');
    });

    specify('should keep spaces of whitespace-only line beyond indentation', async function () {
      const result = await adapter.parse('d: |2\n    \n  Line one.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '  \nLine one.\n');
    });

    specify('should keep last whitespace-only line beyond indentation', async function () {
      const result = await adapter.parse('d: |\n  Line one.\n   \n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n \n');
    });

    specify('should empty whitespace-only lines of block without content', async function () {
      const result = await adapter.parse('d: |2+\n   \n  \n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\n\n');
    });

    specify('should not fold whitespace-only line beyond indentation', async function () {
      const result = await adapter.parse('d: >\n  Line one.\n   \n  Line two.\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n \nLine two.\n');
    });

    specify('should ignore unterminated whitespace-only last line', async function () {
      const result = await adapter.parse('d: |+\n  Line one.\n  ');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n');
    });

    specify('should keep unterminated last line beyond indentation', async function () {
      const result = await adapter.parse('d: |+\n  Line one.\n    ');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n  \n');
    });

    specify('should keep line break of keep chomped whitespace-only block', async function () {
      const result = await adapter.parse('d: |+\n  ');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '\n');
    });

    specify('should drop trailing line not indented deeper than content', async function () {
      const result = await adapter.parse('d: |2-\n    Line one.\n   \n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '  Line one.');
    });

    specify(
      'should drop unterminated trailing line not indented deeper than content',
      async function () {
        const result = await adapter.parse('d: >2\n    Line one.\n   ');
        const { d } = toValue(result.result) as { d: string };
        assert.strictEqual(d, '  Line one.\n');
      },
    );

    specify('should keep spaces of trailing line with keep chomping', async function () {
      const result = await adapter.parse('d: |2+\n    Line one.\n   \n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, '  Line one.\n \n');
    });

    specify(
      'should keep spaces of trailing lines before empty line with keep chomping',
      async function () {
        const result = await adapter.parse('d: |+\n  Line one.\n   \n\n');
        const { d } = toValue(result.result) as { d: string };
        assert.strictEqual(d, 'Line one.\n \n\n');
      },
    );

    specify('should keep whitespace-only line with CRLF line breaks', async function () {
      const result = await adapter.parse('d: |\r\n  Line one.\r\n   \r\n  Line two.\r\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.\n \nLine two.\n');
    });

    specify('should keep trailing spaces in folded style with strip chomping', async function () {
      const result = await adapter.parse('d: >-\n  Line one.  \n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.  ');
    });

    specify('should keep trailing spaces in folded style with keep chomping', async function () {
      const result = await adapter.parse('d: >+\n  Line one.  \n\n');
      const { d } = toValue(result.result) as { d: string };
      assert.strictEqual(d, 'Line one.  \n\n');
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

  context('given YAML 1.2 nested deeper than the scanner state can hold', function () {
    const nested = (depth: number) =>
      Array.from({ length: depth }, (_, i) => `${'  '.repeat(i)}k:`).join('\n') + ' 1\n';

    specify('should report syntax error', async function () {
      const parseResult = await adapter.parse(nested(300));

      assert.isUndefined(parseResult.result);
      assert.strictEqual(toValue(parseResult.errors.get(0)), '(Error YAML syntax error)');
    });

    specify('should keep parsing other documents', async function () {
      for (const depth of [100, 200, 250, 256, 260, 300]) {
        await adapter.parse(nested(depth));
      }
      const parseResult = await adapter.parse('a: 1\n');

      assert.deepEqual(toValue(parseResult.result), { a: 1 });
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
