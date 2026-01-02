import { isObjectElement, ObjectElement } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
export interface JSONReferenceLikeElement extends ObjectElement {
  hasKey: (value: '$ref') => true;
}

/**
 * @public
 */
export const isJSONReferenceLikeElement = (
  element: unknown,
): element is JSONReferenceLikeElement => {
  return isObjectElement(element) && element.hasKey('$ref');
};
