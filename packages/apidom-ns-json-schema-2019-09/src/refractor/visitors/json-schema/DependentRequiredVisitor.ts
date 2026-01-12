import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import { FallbackVisitor, FallbackVisitorOptions } from '@speclynx/apidom-ns-json-schema-draft-7';

export type { FallbackVisitorOptions as DependentRequiredVisitorOptions };

/**
 * @public
 */
class DependentRequiredVisitor extends FallbackVisitor {
  declare public readonly element: ObjectElement;

  ObjectElement(path: Path<ObjectElement>) {
    this.enter(path);
    this.element.classes.push('json-schema-dependentRequired');
  }
}

export default DependentRequiredVisitor;
