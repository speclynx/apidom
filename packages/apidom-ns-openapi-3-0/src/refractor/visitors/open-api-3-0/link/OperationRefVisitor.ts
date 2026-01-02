import { StringElement } from '@speclynx/apidom-datamodel';

import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

export type { FallbackVisitorOptions as OperationRefVisitorOptions };

/**
 * @public
 */
class OperationRefVisitor extends FallbackVisitor {
  declare public readonly element: StringElement;

  StringElement(stringElement: StringElement) {
    const result = super.enter(stringElement);
    this.element.classes.push('reference-value');

    return result;
  }
}

export default OperationRefVisitor;
