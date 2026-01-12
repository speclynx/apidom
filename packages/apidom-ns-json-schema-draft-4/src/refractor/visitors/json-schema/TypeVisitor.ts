import { StringElement, ArrayElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';

export type { FallbackVisitorOptions as TypeVisitorOptions };

/**
 * @public
 */
class TypeVisitor extends FallbackVisitor {
  declare public readonly element: StringElement | ArrayElement;

  StringElement(path: Path<StringElement>) {
    super.enter(path);
    this.element.classes.push('json-schema-type');
  }

  ArrayElement(path: Path<ArrayElement>) {
    super.enter(path);
    this.element.classes.push('json-schema-type');
  }
}

export default TypeVisitor;
