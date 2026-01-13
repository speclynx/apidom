import { assert } from 'chai';
import { includesClasses, hasElementSourceMap } from '@speclynx/apidom-datamodel';

import * as adapter from '../../../../../src/adapter.ts';

const setupMemberElement = async (): Promise<any> => {
  const yamlSource = '{!str &anchor : !str &anchor}';
  const { result } = await adapter.parse(yamlSource, { sourceMap: true });
  // @ts-ignore
  return result.content[0];
};
const setupEmptyKeyElement = async () => (await setupMemberElement()).key;
const setupEmptyValueElement = async () => (await setupMemberElement()).value;

describe('given flow mapping pair containing empty fields and explicit tag and anchor', function () {
  it('should create empty key element', async function () {
    const emptyElement = await setupEmptyKeyElement();

    assert.isTrue(includesClasses(emptyElement, ['yaml-e-node', 'yaml-e-scalar']));
  });

  it('should generate source maps for empty key', async function () {
    const emptyElement = await setupEmptyKeyElement();

    assert.isTrue(hasElementSourceMap(emptyElement));
  });

  it('should generate proper source map start position for empty key', async function () {
    const emptyElement = await setupEmptyKeyElement();
    const [row, column, char] = [
      emptyElement.startLine,
      emptyElement.startCharacter,
      emptyElement.startOffset,
    ];

    assert.strictEqual(row, 0);
    assert.strictEqual(column, 13);
    assert.strictEqual(char, 13);
  });

  it('should generate proper source map end position for empty key', async function () {
    const emptyElement = await setupEmptyKeyElement();
    const [row, column, char] = [
      emptyElement.endLine,
      emptyElement.endCharacter,
      emptyElement.endOffset,
    ];

    assert.strictEqual(row, 0);
    assert.strictEqual(column, 13);
    assert.strictEqual(char, 13);
  });

  it('should create empty value element', async function () {
    const emptyElement = await setupEmptyValueElement();

    assert.isTrue(includesClasses(emptyElement, ['yaml-e-node', 'yaml-e-scalar']));
  });

  it('should generate source maps for empty value', async function () {
    const emptyElement = await setupEmptyValueElement();

    assert.isTrue(hasElementSourceMap(emptyElement));
  });

  it('should generate proper source map start position for empty value', async function () {
    const emptyElement = await setupEmptyValueElement();
    const [row, column, char] = [
      emptyElement.startLine,
      emptyElement.startCharacter,
      emptyElement.startOffset,
    ];

    assert.strictEqual(row, 0);
    assert.strictEqual(column, 28);
    assert.strictEqual(char, 28);
  });

  it('should generate proper source map end position for empty value', async function () {
    const emptyElement = await setupEmptyValueElement();
    const [row, column, char] = [
      emptyElement.endLine,
      emptyElement.endCharacter,
      emptyElement.endOffset,
    ];

    assert.strictEqual(row, 0);
    assert.strictEqual(column, 28);
    assert.strictEqual(char, 28);
  });
});
