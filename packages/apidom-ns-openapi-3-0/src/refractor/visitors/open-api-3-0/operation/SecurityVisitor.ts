import { ArrayElement, isObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import OperationSecurityElement from '../../../../elements/nces/OperationSecurity.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BaseSpecificationVisitorOptions as SecurityVisitorOptions };

/**
 * @public
 */
class SecurityVisitor extends BaseSpecificationVisitor {
  declare public readonly element: OperationSecurityElement;

  constructor(options: BaseSpecificationVisitorOptions) {
    super(options);
    this.element = new OperationSecurityElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item) => {
      const specPath = isObjectElement(item)
        ? ['document', 'objects', 'SecurityRequirement']
        : ['value'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default SecurityVisitor;
