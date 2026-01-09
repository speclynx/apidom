import Element from '../primitives/Element.ts';
import { isArrayElement, isElement } from './primitives.ts';
import { isSourceMapElement } from './elements.ts';

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
 * @public
 */
export const hasElementSourceMap = <T extends Element>(element: T): boolean => {
  if (element.isMetaEmpty) {
    return false;
  }
  return isSourceMapElement(element.meta.get('sourceMap'));
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
