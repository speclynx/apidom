import { StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

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

  StringElement(path: Path<StringElement>) {
    const stringElement = path.node;
    const identifierElement = new IdentifierElement(toValue(stringElement) as string);

    this.copyMetaAndAttributes(stringElement, identifierElement);

    this.element = identifierElement;
    path.stop();
  }
}

export default IdentifierVisitor;
