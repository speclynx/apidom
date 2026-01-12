import { Element } from '@speclynx/apidom-datamodel';
import { traverse, type Path } from '@speclynx/apidom-traverse';

/**
 * Computes upwards edges from every child to its parent.
 * @public
 */
const parents = <T extends Element>(element: T): WeakMap<Element, Element | undefined> => {
  const parentEdges = new WeakMap<Element, Element | undefined>();

  traverse(element, {
    enter(path: Path<Element>) {
      // Use parentPath.node to get the actual Element parent.
      // path.parent could be an array (ArraySlice) when inside ArrayElement/ObjectElement content.
      parentEdges.set(path.node, path.parentPath?.node);
    },
  });

  return parentEdges;
};

export default parents;
