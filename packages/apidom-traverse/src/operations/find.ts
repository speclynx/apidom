import { Element } from '@speclynx/apidom-datamodel';

import { traverse } from '../traversal.ts';
import type { Path } from '../Path.ts';

/**
 * Finds first path whose element satisfies the provided predicate.
 * @public
 */
const find = <T extends Element>(
  element: T,
  predicate: (path: Path<Element>) => boolean,
): Path<Element> | undefined => {
  let result: Path<Element> | undefined;

  traverse(element, {
    enter(path: Path<Element>) {
      if (predicate(path)) {
        result = path;
        path.stop();
      }
    },
  });

  return result;
};

export default find;
