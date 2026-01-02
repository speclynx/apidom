import { ArrayElement } from '@speclynx/apidom-datamodel';

import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';

export type { FallbackVisitorOptions as EnumVisitorOptions };

/**
 * @public
 */
class EnumVisitor extends FallbackVisitor {
  declare public readonly element: ArrayElement;

  ArrayElement(arrayElement: ArrayElement) {
    const result = this.enter(arrayElement);
    this.element.classes.push('json-schema-enum');

    return result;
  }
}

export default EnumVisitor;
