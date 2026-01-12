import { ArrayElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';

export type { FallbackVisitorOptions as RequiredVisitorOptions };

/**
 * @public
 */
class RequiredVisitor extends FallbackVisitor {
  declare public readonly element: ArrayElement;

  ArrayElement(path: Path<ArrayElement>) {
    super.enter(path);
    this.element.classes.push('json-schema-required');
  }
}

export default RequiredVisitor;
