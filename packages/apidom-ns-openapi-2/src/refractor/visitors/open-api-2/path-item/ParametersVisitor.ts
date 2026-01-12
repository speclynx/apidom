import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import PathItemParametersElement from '../../../../elements/nces/PathItemParameters.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from '../bases.ts';

export type { BaseSpecificationVisitorOptions as ParametersVisitorOptions };

/**
 * @public
 */
class ParametersVisitor extends BaseSpecificationVisitor {
  declare public readonly element: PathItemParametersElement;

  constructor(options: BaseSpecificationVisitorOptions) {
    super(options);
    this.element = new PathItemParametersElement();
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
