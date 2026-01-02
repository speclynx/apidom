import {
  Namespace,
  isElement,
  isStringElement,
  isNumberElement,
  isNullElement,
  isBooleanElement,
  isArrayElement,
  isObjectElement,
  isMemberElement,
  isPrimitiveElement,
  isLinkElement,
  isRefElement,
  isAnnotationElement,
  isCommentElement,
  isParseResultElement,
  isSourceMapElement,
  hasElementSourceMap,
  includesSymbols,
  includesClasses,
} from '@speclynx/apidom-datamodel';

import defaultNamespace from '../namespace.ts';

/**
 * @public
 */
export interface Predicates {
  isElement: typeof isElement;
  isStringElement: typeof isStringElement;
  isNumberElement: typeof isNumberElement;
  isNullElement: typeof isNullElement;
  isBooleanElement: typeof isBooleanElement;
  isArrayElement: typeof isArrayElement;
  isObjectElement: typeof isObjectElement;
  isMemberElement: typeof isMemberElement;
  isPrimitiveElement: typeof isPrimitiveElement;
  isLinkElement: typeof isLinkElement;
  isRefElement: typeof isRefElement;
  isAnnotationElement: typeof isAnnotationElement;
  isCommentElement: typeof isCommentElement;
  isParseResultElement: typeof isParseResultElement;
  isSourceMapElement: typeof isSourceMapElement;
  hasElementSourceMap: typeof hasElementSourceMap;
  includesSymbols: typeof includesSymbols;
  includesClasses: typeof includesClasses;
}

const predicates: Predicates = {
  isElement,
  isStringElement,
  isNumberElement,
  isNullElement,
  isBooleanElement,
  isArrayElement,
  isObjectElement,
  isMemberElement,
  isPrimitiveElement,
  isLinkElement,
  isRefElement,
  isAnnotationElement,
  isCommentElement,
  isParseResultElement,
  isSourceMapElement,
  hasElementSourceMap,
  includesSymbols,
  includesClasses,
};

/**
 * @public
 */
export interface Toolbox {
  predicates: Predicates;
  namespace: Namespace;
}

/**
 * @public
 */
const createToolbox = (): Toolbox => {
  return { predicates, namespace: defaultNamespace };
};

export default createToolbox;
