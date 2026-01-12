import { StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

export type { FallbackVisitorOptions as VersionVisitorOptions };

/**
 * @public
 */
class VersionVisitor extends FallbackVisitor {
  declare public element: StringElement;

  StringElement(path: Path<StringElement>) {
    const stringElement = path.node;

    this.element = new StringElement(toValue(stringElement) as string);

    this.copyMetaAndAttributes(stringElement, this.element);
    this.element.classes.push('api-version');
    this.element.classes.push('version');

    path.stop();
  }
}

export default VersionVisitor;
