import { startsWith } from 'ramda';
import {
  MemberElement,
  ObjectElement,
  isStringElement,
  isObjectElement,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

export interface ReusableLikeElement extends ObjectElement {
  hasKey: (value: 'reference') => true;
}

/**
 * @public
 */
export const isArazzoSpecificationExtension = (element: MemberElement): boolean => {
  return isStringElement(element.key) && startsWith('x-', toValue(element.key) as string);
};

export const isReusableLikeElement = (element: unknown): element is ReusableLikeElement => {
  return isObjectElement(element) && element.hasKey('reference');
};
