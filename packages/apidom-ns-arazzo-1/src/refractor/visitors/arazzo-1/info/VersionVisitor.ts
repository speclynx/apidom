import { StringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

export type { FallbackVisitorOptions as VersionVisitorOptions };

/**
 * @public
 */
class VersionVisitor extends FallbackVisitor {
  declare public readonly element: StringElement;

  StringElement(path: Path<StringElement>) {
    super.enter(path);

    this.element.classes.push('arazzo-version');
    this.element.classes.push('version');
  }
}

export default VersionVisitor;
