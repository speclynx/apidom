import { StringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';

export type { FallbackVisitorOptions as HostVisitorOptions };

/**
 * @public
 */
class HostVisitor extends FallbackVisitor {
  declare public readonly element: StringElement;

  StringElement(path: Path<StringElement>) {
    super.enter(path);
    this.element.classes.push('swagger-host');
  }
}

export default HostVisitor;
