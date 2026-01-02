import { ArrayElement, isObjectElement } from '@speclynx/apidom-datamodel';
import { BREAK, cloneDeep } from '@speclynx/apidom-core';

import SecurityElement from '../../../elements/nces/Security.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';

/**
 * @public
 */
export type { BaseSpecificationVisitorOptions as SecurityVisitorOptions };

/**
 * @public
 */
class SecurityVisitor extends BaseSpecificationVisitor {
  declare public readonly element: SecurityElement;

  constructor(options: BaseSpecificationVisitorOptions) {
    super(options);
    this.element = new SecurityElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item) => {
      if (isObjectElement(item)) {
        const element = this.toRefractedElement(
          ['document', 'objects', 'SecurityRequirement'],
          item,
        );
        this.element.push(element);
      } else {
        this.element.push(cloneDeep(item));
      }
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default SecurityVisitor;
