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
export interface ReferenceLikeElement extends ObjectElement {
  hasKey: (value: '$ref') => true;
}

/**
 * @public
 */
export const isReferenceLikeElement = (element: unknown): element is ReferenceLikeElement => {
  return isObjectElement(element) && element.hasKey('$ref');
};

/**
 * @public
 */
export const isServerLikeElement = isObjectElement;

/**
 * @public
 */
export const isTagLikeElement = isObjectElement;

/**
 * @public
 */
export const isOpenApiExtension = (element: MemberElement): boolean => {
  return isStringElement(element.key) && startsWith('x-', toValue(element.key) as string);
};
