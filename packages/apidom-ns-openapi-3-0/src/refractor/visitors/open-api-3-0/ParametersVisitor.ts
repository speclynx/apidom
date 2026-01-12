import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';
import { isReferenceLikeElement } from '../../predicates.ts';
import { isReferenceElement } from '../../../predicates.ts';

/**
 * @public
 */
export type { BaseSpecificationVisitorOptions as ParametersVisitorOptions };

/**
 * @public
 */
class ParametersVisitor extends BaseSpecificationVisitor {
  declare public readonly element: ArrayElement;

  constructor(options: BaseSpecificationVisitorOptions) {
    super(options);
    this.element = new ArrayElement();
    this.element.classes.push('parameters');
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item: Element): void => {
      const specPath = isReferenceLikeElement(item)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Parameter'];
      const element = this.toRefractedElement(specPath, item);

      if (isReferenceElement(element)) {
        element.meta.set('referenced-element', 'parameter');
      }

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default ParametersVisitor;
