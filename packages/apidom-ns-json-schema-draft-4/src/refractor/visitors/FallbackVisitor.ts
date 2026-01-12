import { Element, cloneDeep } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import Visitor, { VisitorOptions } from './Visitor.ts';

/**
 * This visitor is responsible for falling back to current traversed element
 * Given JSONSchemaVisitor expects ObjectElement to be traversed. If
 * different Element is provided FallBackVisitor is responsible to assigning
 * this Element as current element.
 * @public
 */
export type { VisitorOptions as FallbackVisitorOptions };

/**
 * @public
 */
class FallbackVisitor extends Visitor {
  enter(path: Path<Element>) {
    this.element = cloneDeep(path.node);
    path.stop();
  }
}

export default FallbackVisitor;
