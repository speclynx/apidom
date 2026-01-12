import { StringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import { FallbackVisitor, FallbackVisitorOptions } from '@speclynx/apidom-ns-json-schema-draft-7';

export type { FallbackVisitorOptions as $refVisitorOptions };

/**
 * @public
 */
class $refVisitor extends FallbackVisitor {
  declare public readonly element: StringElement;

  StringElement(path: Path<StringElement>) {
    this.enter(path);
    this.element.classes.push('reference-value');
  }
}

export default $refVisitor;
