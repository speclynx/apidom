import Element from '../primitives/Element.ts';
import { isArrayElement, isElement } from './primitives.ts';

export {
  isStringElement,
  isNumberElement,
  isNullElement,
  isBooleanElement,
  isArrayElement,
  isObjectElement,
  isMemberElement,
  isPrimitiveElement,
} from './primitives.ts';
export { isElement };
export type { PrimitiveElement } from './primitives.ts';

export {
  isLinkElement,
  isRefElement,
  isAnnotationElement,
  isCommentElement,
  isParseResultElement,
  isSourceMapElement,
} from './elements.ts';

/**
 * Checks if an element has complete source position information.
 * Returns true only if all 6 position properties are numbers.
 * @public
 */
export const hasElementSourceMap = <T extends Element>(element: T): boolean => {
  return (
    typeof element.startLine === 'number' &&
    typeof element.startCharacter === 'number' &&
    typeof element.startOffset === 'number' &&
    typeof element.endLine === 'number' &&
    typeof element.endCharacter === 'number' &&
    typeof element.endOffset === 'number'
  );
};

/**
 * @public
 */
export const includesSymbols = <T extends Element>(element: T, symbols: string[]): boolean => {
  if (symbols.length === 0) {
    return true;
  }

  if (!element.hasAttributesProperty('symbols')) {
    return false;
  }

  const elementSymbols = element.attributes.get('symbols');

  if (!isArrayElement(elementSymbols)) {
    return false;
  }

  return symbols.every((symbol) => elementSymbols.includes(symbol));
};

/**
 * @public
 */
export const includesClasses = <T extends Element>(element: T, classes: string[]): boolean => {
  if (classes.length === 0) {
    return true;
  }
  if (!isElement(element)) {
    return false;
  }
  if (element.isMetaEmpty) {
    return false;
  }
  if (!element.hasMetaProperty('classes')) {
    return false;
  }

  return classes.every((cls) => element.classes.includes(cls));
};
