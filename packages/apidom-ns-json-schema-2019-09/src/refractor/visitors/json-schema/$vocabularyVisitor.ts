import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import { FallbackVisitor, FallbackVisitorOptions } from '@speclynx/apidom-ns-json-schema-draft-7';

export type { FallbackVisitorOptions as $vocabularyVisitorOptions };

/**
 * @public
 */
class $vocabularyVisitor extends FallbackVisitor {
  declare public readonly element: ObjectElement;

  ObjectElement(path: Path<ObjectElement>) {
    this.enter(path);
    this.element.classes.push('json-schema-$vocabulary');
  }
}

export default $vocabularyVisitor;
