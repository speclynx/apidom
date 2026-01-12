import { Element } from '@speclynx/apidom-datamodel';
import { traverse, type Path } from '@speclynx/apidom-traverse';

/**
 * Finds all elements matching the predicate.
 * @public
 */
const filter = <T extends Element>(
  predicate: (element: Element) => boolean,
  element: T,
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
