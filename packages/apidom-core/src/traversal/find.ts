import { Element } from '@speclynx/apidom-datamodel';
import { traverse, type Path } from '@speclynx/apidom-traverse';

/**
 * Find first element that satisfies the provided predicate.
 * @public
 */
const find = <T extends Element>(
  predicate: (element: any) => boolean,
  element: T,
): T | undefined => {
  let result: T | undefined;

  traverse(element, {
    enter(path: Path<Element>) {
      if (predicate(path.node)) {
        result = path.node as T;
        path.stop();
      }
    },
  });

  return result;
};

export default find;
