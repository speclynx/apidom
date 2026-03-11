import { Element } from '@speclynx/apidom-datamodel';

import find from './find.ts';
import type { Path } from '../Path.ts';

/**
 * Tests whether at least one path's element passes the predicate.
 * @public
 */
const some = <T extends Element>(
  element: T,
  predicate: (path: Path<Element>) => boolean,
): boolean => {
  return find(element, predicate) !== undefined;
};

export default some;
