import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item: Element) => {
      const securityRequirementElement = this.toRefractedElement(
        ['document', 'objects', 'SecurityRequirement'],
        item,
      );
      this.element.push(securityRequirementElement);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default SecurityVisitor;
