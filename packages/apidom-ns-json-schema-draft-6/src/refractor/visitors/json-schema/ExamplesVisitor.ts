import { ArrayElement } from '@speclynx/apidom-core';
import { FallbackVisitor, FallbackVisitorOptions } from '@speclynx/apidom-ns-json-schema-draft-4';

export type { FallbackVisitorOptions as ExamplesVisitorOptions };

/**
 * @public
 */
class ExamplesVisitor extends FallbackVisitor {
  declare public readonly element: ArrayElement;

  ArrayElement(arrayElement: ArrayElement) {
    const result = this.enter(arrayElement);
    this.element.classes.push('json-schema-examples');

    return result;
  }
}

export default ExamplesVisitor;
