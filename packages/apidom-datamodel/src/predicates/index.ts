import Element from '../primitives/Element.ts';
import { isArrayElement } from './primitives.ts';
import { isSourceMapElement } from './elements.ts';

export {
  isElement,
  isStringElement,
  isNumberElement,
  isNullElement,
  isBooleanElement,
  isArrayElement,
  isObjectElement,
  isMemberElement,
  isPrimitiveElement,
} from './primitives.ts';
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
export const hasElementSourceMap = <T extends Element>(element: T): boolean =>
  isSourceMapElement(element.meta.get('sourceMap'));

/**
 * @public
 */
export const includesSymbols = <T extends Element>(element: T, symbols: string[]): boolean => {
  if (symbols.length === 0) {
    return true;
  }

  if (!(element as unknown as { _attributes?: unknown })._attributes) {
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

  if (!(element as unknown as { _meta?: unknown })._meta) {
    return false;
  }

  return classes.every((cls) => element.classes.includes(cls));
};
