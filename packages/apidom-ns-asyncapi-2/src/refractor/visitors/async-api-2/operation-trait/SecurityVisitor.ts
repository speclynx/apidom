import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from '../bases.ts';
import OperationTraitSecurityElement from '../../../../elements/nces/OperationTraitSecurity.ts';

/**
 * @public
 */
export type SecurityVisitorOptions = BaseSpecificationVisitorOptions;

/**
 * @public
 */
class SecurityVisitor extends BaseSpecificationVisitor {
  declare public readonly element: OperationTraitSecurityElement;

  constructor(options: SecurityVisitorOptions) {
    super(options);
    this.element = new OperationTraitSecurityElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element) => {
      const securityRequirementElement = this.toRefractedElement(
        ['document', 'objects', 'SecurityRequirement'],
        item,
      );
      this.element.push(securityRequirementElement);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default SecurityVisitor;
