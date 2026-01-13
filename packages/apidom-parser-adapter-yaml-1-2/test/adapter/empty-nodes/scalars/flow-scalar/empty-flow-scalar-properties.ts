import { assert } from 'chai';
import { includesClasses, hasElementSourceMap } from '@speclynx/apidom-datamodel';

import * as adapter from '../../../../../src/adapter.ts';

const setupMemberElement = async (): Promise<any> => {
  const yamlSource = '!str &anchor';
  const { result } = await adapter.parse(yamlSource, { sourceMap: true });
  return result;
};

describe('given empty flow scalar node with and explicit tag and anchor', function () {
  it('should create empty element', async function () {
    const emptyElement = await setupMemberElement();

    assert.isTrue(includesClasses(emptyElement, ['yaml-e-node', 'yaml-e-scalar']));
  });

  it('should generate source maps', async function () {
    const emptyElement = await setupMemberElement();

    assert.isTrue(hasElementSourceMap(emptyElement));
  });

  it('should generate proper source map start position', async function () {
    const emptyElement = await setupMemberElement();
    const [row, column, char] = [
      emptyElement.startLine,
      emptyElement.startCharacter,
      emptyElement.startOffset,
    ];

    assert.strictEqual(row, 0);
    assert.strictEqual(column, 12);
    assert.strictEqual(char, 12);
  });

  it('should generate proper source map end position', async function () {
    const emptyElement = await setupMemberElement();
    const [row, column, char] = [
      emptyElement.endLine,
      emptyElement.endCharacter,
      emptyElement.endOffset,
    ];

    assert.strictEqual(row, 0);
    assert.strictEqual(column, 12);
    assert.strictEqual(char, 12);
  });
});
