import { startsWith } from 'ramda';
import {
  MemberElement,
  ObjectElement,
  isStringElement,
  isObjectElement,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
export const isOverlaySpecificationExtension = (element: MemberElement): boolean => {
  return isStringElement(element.key) && startsWith('x-', element.key.toValue() as string);
};

/**
 * @public
 */
export interface ReusableActionReferenceLikeElement extends ObjectElement {
  hasKey: (value: '$ref') => true;
}

/**
 * @public
 */
export const isReusableActionReferenceLikeElement = (
  element: unknown,
): element is ReusableActionReferenceLikeElement => {
  return isObjectElement(element) && element.hasKey('$ref');
};
