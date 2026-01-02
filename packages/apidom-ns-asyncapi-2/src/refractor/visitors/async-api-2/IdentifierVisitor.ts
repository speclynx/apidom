import { StringElement } from '@speclynx/apidom-datamodel';
import { BREAK, toValue } from '@speclynx/apidom-core';

import IdentifierElement from '../../../elements/Identifier.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';

/**
 * @public
 */
export type IdentifierVisitorOptions = BaseSpecificationVisitorOptions;

/**
 * @public
 */
class IdentifierVisitor extends BaseSpecificationVisitor {
  declare public element: IdentifierElement;

  StringElement(stringElement: StringElement) {
    const identifierElement = new IdentifierElement(toValue(stringElement) as string);

    this.copyMetaAndAttributes(stringElement, identifierElement);

    this.element = identifierElement;
    return BREAK;
  }
}

export default IdentifierVisitor;
