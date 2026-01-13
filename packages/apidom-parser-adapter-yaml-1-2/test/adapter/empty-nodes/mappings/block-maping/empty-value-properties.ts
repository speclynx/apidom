import { assert } from 'chai';
import { includesClasses, hasElementSourceMap } from '@speclynx/apidom-datamodel';

import * as adapter from '../../../../../src/adapter.ts';

const setupEmptyElement = async () => {
  const yamlSource = 'key: !str &anchor';
  const { result } = await adapter.parse(yamlSource, { sourceMap: true });
  // @ts-ignore
  return result.get('key');
};

describe('given empty node with tag and anchor as block mapping value', function () {
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
    assert.strictEqual(column, 17);
    assert.strictEqual(char, 17);
  });

  it('should generate proper source map end position', async function () {
    const emptyElement = await setupEmptyElement();
    const [row, column, char] = [
      emptyElement.endLine,
      emptyElement.endCharacter,
      emptyElement.endOffset,
    ];

    assert.strictEqual(row, 0);
    assert.strictEqual(column, 17);
    assert.strictEqual(char, 17);
  });
});
