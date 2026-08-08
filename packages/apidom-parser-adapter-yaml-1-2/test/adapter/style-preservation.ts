import { assert } from 'chai';

import * as adapter from '../../src/adapter.ts';

describe('adapter', function () {
  context('given style preservation is enabled', function () {
    context('given comment before the first document', function () {
      specify('should capture it as commentBefore on the result element', async function () {
        const source = '# top of document comment\na: 1\n';

        const parseResult = await adapter.parse(source, { style: true });
        const result = parseResult.result!;

        assert.deepInclude(result.style?.yaml, { commentBefore: ' top of document comment' });
      });
    });

    context('given multiple comments before the first document', function () {
      specify('should capture them joined by newlines', async function () {
        const source = '# first line\n# second line\na: 1\n';

        const parseResult = await adapter.parse(source, { style: true });
        const result = parseResult.result!;

        assert.deepInclude(result.style?.yaml, { commentBefore: ' first line\n second line' });
      });
    });

    context('given comment before a mapping entry', function () {
      specify('should capture the text after "#" verbatim', async function () {
        const source = 'a: 1\n# entry comment\nb: 2\n';

        const parseResult = await adapter.parse(source, { style: true });
        const result = parseResult.result!;
        // @ts-ignore
        const member = result.getMember('b');

        assert.deepInclude(member.style?.yaml, { commentBefore: ' entry comment' });
      });
    });

    context('given inline comment after a mapping entry', function () {
      specify('should capture the text after "#" verbatim', async function () {
        const source = 'a: 1 # inline comment\n';

        const parseResult = await adapter.parse(source, { style: true });
        const result = parseResult.result!;
        // @ts-ignore
        const member = result.getMember('a');

        assert.deepInclude(member.style?.yaml, { comment: ' inline comment' });
      });
    });

    context('given comment on the key line before a nested block value', function () {
      specify('should capture the text after "#" verbatim on the key', async function () {
        const source = 'a: # key line comment\n    nested: 1\n';

        const parseResult = await adapter.parse(source, { style: true });
        const result = parseResult.result!;
        // @ts-ignore
        const member = result.getMember('a');

        assert.deepInclude(member.key.style?.yaml, { comment: ' key line comment' });
      });
    });

    context('given comment on its own line before a nested block value', function () {
      specify('should capture the text after "#" verbatim on the value', async function () {
        const source = 'a:\n    # own line comment\n    nested: 1\n';

        const parseResult = await adapter.parse(source, { style: true });
        const result = parseResult.result!;
        // @ts-ignore
        const member = result.getMember('a');

        assert.deepInclude(member.value.style?.yaml, { commentBefore: ' own line comment' });
      });
    });
  });
});
