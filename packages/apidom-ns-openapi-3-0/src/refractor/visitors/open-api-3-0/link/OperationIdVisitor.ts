import { StringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

export type { FallbackVisitorOptions as OperationIdVisitorOptions };

/**
 * @public
 */
class OperationIdVisitor extends FallbackVisitor {
  declare public readonly element: StringElement;

  StringElement(path: Path<StringElement>) {
    super.enter(path);
    this.element.classes.push('reference-value');
  }
}

export default OperationIdVisitor;
