import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import SwaggerSecurityElement from '../../../elements/nces/SwaggerSecurity.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';

export type { BaseSpecificationVisitorOptions as SecurityVisitorOptions };

/**
 * @public
 */
class SecurityVisitor extends BaseSpecificationVisitor {
  declare public readonly element: SwaggerSecurityElement;

  constructor(options: BaseSpecificationVisitorOptions) {
    super(options);
    this.element = new SwaggerSecurityElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'SecurityRequirement'];
      const element = this.toRefractedElement(specPath, item);
      this.element.push(element);
    });
    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default SecurityVisitor;
