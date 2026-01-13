import { assert } from 'chai';
import { SourceMapElement, StringElement } from '../../src/index.ts';

describe('SourceMapElement', function () {
  describe('#element', function () {
    specify('is sourceMap', function () {
      const element = new SourceMapElement();
      assert.strictEqual(element.element, 'sourceMap');
    });
  });

  describe('.from', function () {
    specify('creates SourceMapElement from element with all position properties', function () {
      const element = new StringElement('test');
      element.startLine = 0;
      element.startCharacter = 5;
      element.startOffset = 5;
      element.endLine = 0;
      element.endCharacter = 10;
      element.endOffset = 10;

      const sourceMap = SourceMapElement.from(element);

      assert.isDefined(sourceMap);
      assert.instanceOf(sourceMap, SourceMapElement);
      assert.isString(sourceMap!.content);
      assert.isTrue((sourceMap!.content as string).startsWith('sm1:'));
    });

    specify('assigns position properties to instance for inspection', function () {
      const element = new StringElement('test');
      element.startLine = 1;
      element.startCharacter = 2;
      element.startOffset = 3;
      element.endLine = 4;
      element.endCharacter = 5;
      element.endOffset = 6;

      const sourceMap = SourceMapElement.from(element);

      assert.strictEqual(sourceMap!.startLine, 1);
      assert.strictEqual(sourceMap!.startCharacter, 2);
      assert.strictEqual(sourceMap!.startOffset, 3);
      assert.strictEqual(sourceMap!.endLine, 4);
      assert.strictEqual(sourceMap!.endCharacter, 5);
      assert.strictEqual(sourceMap!.endOffset, 6);
    });

    specify('returns undefined when startLine is missing', function () {
      const element = new StringElement('test');
      element.startCharacter = 5;
      element.startOffset = 5;
      element.endLine = 0;
      element.endCharacter = 10;
      element.endOffset = 10;

      const sourceMap = SourceMapElement.from(element);

      assert.isUndefined(sourceMap);
    });

    specify('returns undefined when any position property is missing', function () {
      const element = new StringElement('test');
      element.startLine = 0;
      element.startCharacter = 5;
      // startOffset missing
      element.endLine = 0;
      element.endCharacter = 10;
      element.endOffset = 10;

      const sourceMap = SourceMapElement.from(element);

      assert.isUndefined(sourceMap);
    });

    specify('returns undefined when element has no position properties', function () {
      const element = new StringElement('test');

      const sourceMap = SourceMapElement.from(element);

      assert.isUndefined(sourceMap);
    });
  });

  describe('#applyTo', function () {
    specify('applies decoded position properties to target element', function () {
      const element = new StringElement('source');
      element.startLine = 1;
      element.startCharacter = 2;
      element.startOffset = 3;
      element.endLine = 4;
      element.endCharacter = 5;
      element.endOffset = 6;

      const sourceMap = SourceMapElement.from(element)!;
      const target = new StringElement('target');

      sourceMap.applyTo(target);

      assert.strictEqual(target.startLine, 1);
      assert.strictEqual(target.startCharacter, 2);
      assert.strictEqual(target.startOffset, 3);
      assert.strictEqual(target.endLine, 4);
      assert.strictEqual(target.endCharacter, 5);
      assert.strictEqual(target.endOffset, 6);
    });

    specify('does nothing when content is empty', function () {
      const sourceMap = new SourceMapElement();
      const target = new StringElement('target');

      sourceMap.applyTo(target);

      assert.isUndefined(target.startLine);
      assert.isUndefined(target.startCharacter);
      assert.isUndefined(target.startOffset);
      assert.isUndefined(target.endLine);
      assert.isUndefined(target.endCharacter);
      assert.isUndefined(target.endOffset);
    });
  });

  describe('round-trip: from -> applyTo', function () {
    specify('preserves position values through round-trip', function () {
      const original = new StringElement('original');
      original.startLine = 10;
      original.startCharacter = 20;
      original.startOffset = 100;
      original.endLine = 15;
      original.endCharacter = 25;
      original.endOffset = 150;

      const sourceMap = SourceMapElement.from(original);
      const target = new StringElement('target');
      sourceMap!.applyTo(target);

      assert.strictEqual(target.startLine, original.startLine);
      assert.strictEqual(target.startCharacter, original.startCharacter);
      assert.strictEqual(target.startOffset, original.startOffset);
      assert.strictEqual(target.endLine, original.endLine);
      assert.strictEqual(target.endCharacter, original.endCharacter);
      assert.strictEqual(target.endOffset, original.endOffset);
    });
  });
});
