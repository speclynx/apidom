import { Element } from '@speclynx/apidom-datamodel';

import { traverse } from '../traversal.ts';
import type { Path } from '../Path.ts';

/**
 * Find first element that satisfies the provided predicate.
 * @public
 */
const find = <T extends Element>(
  element: T,
  predicate: (element: Element) => boolean,
): Element | undefined => {
  let result: Element | undefined;

  traverse(element, {
    enter(path: Path<Element>) {
      if (predicate(path.node)) {
        result = path.node;
        path.stop();
      }
    },
  });

  return result;
};

export default find;
