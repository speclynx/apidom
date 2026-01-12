import { Element } from '@speclynx/apidom-datamodel';

import { traverse } from '../traversal.ts';
import type { Path } from '../Path.ts';

/**
 * Finds all elements matching the predicate.
 * @public
 */
const filter = <T extends Element>(
  element: T,
  predicate: (element: Element) => boolean,
): Element[] => {
  const result: Element[] = [];

  traverse(element, {
    enter(path: Path<Element>) {
      if (predicate(path.node)) {
        result.push(path.node);
      }
    },
  });

  return result;
};

export default filter;
