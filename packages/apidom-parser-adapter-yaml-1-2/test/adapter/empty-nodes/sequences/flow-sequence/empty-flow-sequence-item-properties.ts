import { assert } from 'chai';
import { includesClasses, hasElementSourceMap } from '@speclynx/apidom-datamodel';

import * as adapter from '../../../../../src/adapter.ts';

const setupEmptyElement = async () => {
  const yamlSource = '[!string &anchor]';
  const { result } = await adapter.parse(yamlSource, { sourceMap: true });
  // @ts-ignore
  return result.get(0);
};

describe('given empty node with tag and anchor as flow sequence item', function () {
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

    assert.strictEqual(emptyElement.startLine, 0);
    assert.strictEqual(emptyElement.startCharacter, 16);
    assert.strictEqual(emptyElement.startOffset, 16);
  });

  it('should generate proper source map end position', async function () {
    const emptyElement = await setupEmptyElement();

    assert.strictEqual(emptyElement.endLine, 0);
    assert.strictEqual(emptyElement.endCharacter, 16);
    assert.strictEqual(emptyElement.endOffset, 16);
  });
});
