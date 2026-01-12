import { ArrayElement, isObjectElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

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

    path.stop();
  }
}

export default SecurityVisitor;
