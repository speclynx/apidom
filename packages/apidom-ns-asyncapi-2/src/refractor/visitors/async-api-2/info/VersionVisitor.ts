import { StringElement } from '@speclynx/apidom-datamodel';
import { BREAK, toValue } from '@speclynx/apidom-core';

import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

export type { FallbackVisitorOptions as VersionVisitorOptions };

/**
 * @public
 */
class VersionVisitor extends FallbackVisitor {
  declare public element: StringElement;

  StringElement(stringElement: StringElement) {
    this.element = new StringElement(toValue(stringElement) as string);

    this.copyMetaAndAttributes(stringElement, this.element);
    this.element.classes.push('api-version');
    this.element.classes.push('version');

    return BREAK;
  }
}

export default VersionVisitor;
