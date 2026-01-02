import { assert } from 'chai';
import {
  ObjectElement,
  StringElement,
  MemberElement,
  ParseResultElement,
  SourceMapElement,
} from '@speclynx/apidom-datamodel';

import { findAtOffset } from '../../src/index.ts';

/**
 * Helper to create a SourceMapElement with the given character positions.
 * Simulates parsing of: {"prop": "val"}
 *                       0123456789...
 */
const createSourceMap = (startChar: number, endChar: number): SourceMapElement => {
  const sourceMap = new SourceMapElement();
  sourceMap.position = {
    start: { row: 0, column: startChar, char: startChar },
    end: { row: 0, column: endChar, char: endChar },
  };
  return sourceMap;
};

/**
 * Helper to set sourceMap on an element's meta.
 */
const setSourceMap = <T extends { meta: ObjectElement }>(
  element: T,
  startChar: number,
  endChar: number,
): T => {
  element.meta.set('sourceMap', createSourceMap(startChar, endChar));
  return element;
};

describe('traversal', function () {
  context('findAtOffset', function () {
    context('given JSON object', function () {
      let parseResult: ParseResultElement;
      let objectElement: ObjectElement;
      let memberElement: MemberElement;
      let keyElement: StringElement;
      let valueElement: StringElement;

      beforeEach(function () {
        // Simulate parsing: {"prop": "val"}
        //                   0123456789012345
        // Positions:
        // - Object: 0-15 (entire object including braces)
        // - Member: 1-14 (the prop/val pair, excluding braces)
        // - Key "prop": 1-7 (including quotes)
        // - Value "val": 9-14 (including quotes)

        keyElement = new StringElement('prop');
        setSourceMap(keyElement, 1, 7);

        valueElement = new StringElement('val');
        setSourceMap(valueElement, 9, 14);

        memberElement = new MemberElement(keyElement, valueElement);
        setSourceMap(memberElement, 1, 14);

        objectElement = new ObjectElement();
        (objectElement.content as MemberElement[]).push(memberElement);
        setSourceMap(objectElement, 0, 15);

        parseResult = new ParseResultElement([objectElement]);
      });

      specify('should find MemberElement and not dive in', function () {
        const found = findAtOffset(0, parseResult);

        assert.strictEqual(found, parseResult.get(0));
      });

      specify('should find key as most inner node', function () {
        const found = findAtOffset(5, parseResult);

        assert.strictEqual(found, (parseResult.get(0) as ObjectElement).getMember('prop')!.key);
      });

      specify('should find value as most inner node', function () {
        const found = findAtOffset(12, parseResult);

        assert.strictEqual(found, (parseResult.get(0) as ObjectElement).getMember('prop')!.value);
      });

      context('given out of range offset', function () {
        specify('should not find anything', function () {
          const found = findAtOffset(10000000, parseResult);

          assert.isUndefined(found);
        });
      });

      context('given negative offset', function () {
        specify('should not find anything', function () {
          const found = findAtOffset(-4, parseResult);

          assert.isUndefined(found);
        });
      });
    });
  });
});
