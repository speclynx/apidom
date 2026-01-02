import { ArrayElement } from '@speclynx/apidom-datamodel';

import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';

export type { FallbackVisitorOptions as RequiredVisitorOptions };

/**
 * @public
 */
class RequiredVisitor extends FallbackVisitor {
  declare public readonly element: ArrayElement;

  ArrayElement(arrayElement: ArrayElement) {
    const result = this.enter(arrayElement);
    this.element.classes.push('json-schema-required');

    return result;
  }
}

export default RequiredVisitor;
