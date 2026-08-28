import { startsWith } from 'ramda';
import {
  MemberElement,
  ObjectElement,
  isStringElement,
  isObjectElement,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

/**
 * @public
 */
export interface ReusableLikeElement extends ObjectElement {
  hasKey: (value: 'reference') => true;
}

/**
 * @public
 */
export const isArazzoSpecificationExtension = (element: MemberElement): boolean => {
  return isStringElement(element.key) && startsWith('x-', toValue(element.key) as string);
};

/**
 * @public
 */
export const isReusableLikeElement = (element: unknown): element is ReusableLikeElement => {
  return isObjectElement(element) && element.hasKey('reference');
};

/**
 * @public
 */
export interface SelectorLikeElement extends ObjectElement {
  hasKey: (value: 'context' | 'selector' | 'type') => true;
}

/**
 * Selector Object is structurally indistinguishable from an arbitrary object literal
 * in positions typed as `Any | {expression} | Selector Object`. Following the guidance in
 * https://github.com/OAI/Arazzo-Specification/issues/519, an object is treated as a Selector Object
 * when it carries all of its REQUIRED fields.
 */
export const isSelectorLikeElement = (element: unknown): element is SelectorLikeElement => {
  return (
    isObjectElement(element) &&
    element.hasKey('context') &&
    element.hasKey('selector') &&
    element.hasKey('type')
  );
};
