import { Element } from '@speclynx/apidom-datamodel';

import filter from './filter.ts';
import type { Path } from '../Path.ts';

/**
 * Complement of filter. Finds all paths whose elements do NOT match the predicate.
 * @public
 */
const reject = <T extends Element>(
  element: T,
  predicate: (path: Path<Element>) => boolean,
): Path<Element>[] => {
  return filter(element, (path) => !predicate(path));
};

export default reject;
