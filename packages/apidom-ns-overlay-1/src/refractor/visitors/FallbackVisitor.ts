import { Element, cloneDeep } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import Visitor, { VisitorOptions } from './Visitor.ts';

/**
 * This visitor is responsible for falling back to current traversed element.
 * Given OverlayVisitor expects ObjectElement to be traversed. If
 * different Element is provided FallbackVisitor is responsible for assigning
 * this Element as current element.
 */

export type { VisitorOptions as FallbackVisitorOptions };

/**
 * @public
 */
class FallbackVisitor extends Visitor {
  enter(path: Path<Element>) {
    this.element = this.consume ? path.node : cloneDeep(path.node);
    path.stop();
  }
}

export default FallbackVisitor;
