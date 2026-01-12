import { ArrayElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';

export type { FallbackVisitorOptions as EnumVisitorOptions };

/**
 * @public
 */
class EnumVisitor extends FallbackVisitor {
  declare public readonly element: ArrayElement;

  ArrayElement(path: Path<ArrayElement>) {
    super.enter(path);
    this.element.classes.push('json-schema-enum');
  }
}

export default EnumVisitor;
