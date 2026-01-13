import { assert } from 'chai';
import { includesClasses, hasElementSourceMap } from '@speclynx/apidom-datamodel';

import * as adapter from '../../../../../src/adapter.ts';

const setupEmptyElement = async () => {
  const yamlSource = '{!str &anchor : value}';
  const { result } = await adapter.parse(yamlSource, { sourceMap: true });
  // @ts-ignore
  return result.getMember('').key;
};

describe('given empty node with tag and anchor as flow mapping key', function () {
  it('should create empty element', async function () {
    const emptyElement = await setupEmptyElement();

    assert.isTrue(includesClasses(emptyElement, ['yaml-e-node', 'yaml-e-scalar']));
  });

  it('should generate source maps', async function () {
    const emptyElement = await setupEmptyElement();

    assert.isTrue(hasElementSourceMap(emptyElement));
  });

  it('should generate proper source map start position', async function () {
    const emptyElement = await setupEmptyElement();
    const [row, column, char] = [
      emptyElement.startLine,
      emptyElement.startCharacter,
      emptyElement.startOffset,
    ];

    assert.strictEqual(row, 0);
    assert.strictEqual(column, 13);
    assert.strictEqual(char, 13);
  });

  it('should generate proper source map end position', async function () {
    const emptyElement = await setupEmptyElement();
    const [row, column, char] = [
      emptyElement.endLine,
      emptyElement.endCharacter,
      emptyElement.endOffset,
    ];

    assert.strictEqual(row, 0);
    assert.strictEqual(column, 13);
    assert.strictEqual(char, 13);
  });
});
