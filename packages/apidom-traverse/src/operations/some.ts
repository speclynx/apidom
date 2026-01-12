import { Element } from '@speclynx/apidom-datamodel';

import find from './find.ts';

/**
 * Tests whether at least one element passes the predicate.
 * @public
 */
const some = <T extends Element>(element: T, predicate: (element: Element) => boolean): boolean => {
  return find(element, predicate) !== undefined;
};

export default some;
