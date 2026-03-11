import { Element } from '@speclynx/apidom-datamodel';

import { traverse } from '../traversal.ts';
import type { Path } from '../Path.ts';

/**
 * Finds all paths whose elements match the predicate.
 * @public
 */
const filter = <T extends Element>(
  element: T,
  predicate: (path: Path<Element>) => boolean,
): Path<Element>[] => {
  const result: Path<Element>[] = [];

  traverse(element, {
    enter(path: Path<Element>) {
      if (predicate(path)) {
        result.push(path);
      }
    },
  });

  return result;
};

export default filter;
