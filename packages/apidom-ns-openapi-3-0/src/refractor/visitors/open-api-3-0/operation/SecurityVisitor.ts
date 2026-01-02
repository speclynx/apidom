import { ArrayElement, isObjectElement } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

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

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item) => {
      const specPath = isObjectElement(item)
        ? ['document', 'objects', 'SecurityRequirement']
        : ['value'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default SecurityVisitor;
