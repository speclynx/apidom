import { assert } from 'chai';
import {
  ObjectElement,
  StringElement,
  MemberElement,
  ParseResultElement,
} from '@speclynx/apidom-datamodel';

import { findAtOffset } from '../../src/index.ts';

/**
 * Helper to set source map properties on an element.
 * Simulates parsing of: {"prop": "val"}
 *                       0123456789...
 */
const setSourceMap = <
  T extends {
    startLine?: number;
    startCharacter?: number;
    startOffset?: number;
    endLine?: number;
    endCharacter?: number;
    endOffset?: number;
  },
>(
  element: T,
  startChar: number,
  endChar: number,
): T => {
  element.startLine = 0;
  element.startCharacter = startChar;
  element.startOffset = startChar;
  element.endLine = 0;
  element.endCharacter = endChar;
  element.endOffset = endChar;
  return element;
};

describe('operations', function () {
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
        const found = findAtOffset(parseResult, 0);

        assert.strictEqual(found, parseResult.get(0));
      });

      specify('should find key as most inner node', function () {
        const found = findAtOffset(parseResult, 5);

        assert.strictEqual(found, (parseResult.get(0) as ObjectElement).getMember('prop')!.key);
      });

      specify('should find value as most inner node', function () {
        const found = findAtOffset(parseResult, 12);

        assert.strictEqual(found, (parseResult.get(0) as ObjectElement).getMember('prop')!.value);
      });

      context('given out of range offset', function () {
        specify('should not find anything', function () {
          const found = findAtOffset(parseResult, 10000000);

          assert.isUndefined(found);
        });
      });

      context('given negative offset', function () {
        specify('should not find anything', function () {
          const found = findAtOffset(parseResult, -4);

          assert.isUndefined(found);
        });
      });
    });
  });
});
