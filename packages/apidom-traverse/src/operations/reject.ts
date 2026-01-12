import { Element } from '@speclynx/apidom-datamodel';

import filter from './filter.ts';

/**
 * Complement of filter. Finds all elements NOT matching the predicate.
 * @public
 */
const reject = <T extends Element>(
  element: T,
  predicate: (element: Element) => boolean,
): Element[] => {
  return filter(element, (el) => !predicate(el));
};

export default reject;
