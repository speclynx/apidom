import { ArrayElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import { FallbackVisitor, FallbackVisitorOptions } from '@speclynx/apidom-ns-json-schema-draft-4';

export type { FallbackVisitorOptions as ExamplesVisitorOptions };

/**
 * @public
 */
class ExamplesVisitor extends FallbackVisitor {
  declare public readonly element: ArrayElement;

  ArrayElement(path: Path<ArrayElement>) {
    this.enter(path);
    this.element.classes.push('json-schema-examples');
  }
}

export default ExamplesVisitor;
