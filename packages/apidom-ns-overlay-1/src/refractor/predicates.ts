import { startsWith } from 'ramda';
import { MemberElement, isStringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

/**
 * @public
 */
export const isOverlaySpecificationExtension = (element: MemberElement): boolean => {
  return isStringElement(element.key) && startsWith('x-', toValue(element.key) as string);
};
