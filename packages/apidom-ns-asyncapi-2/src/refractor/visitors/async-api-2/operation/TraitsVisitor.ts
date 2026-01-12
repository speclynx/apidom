import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import OperationTraitsElement from '../../../../elements/nces/OperationTraits.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from '../bases.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';

/**
 * @public
 */
export type TraitsVisitorOptions = BaseSpecificationVisitorOptions;

/**
 * @public
 */
class TraitsVisitor extends BaseSpecificationVisitor {
  declare public readonly element: OperationTraitsElement;

  constructor(options: TraitsVisitorOptions) {
    super(options);
    this.element = new OperationTraitsElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item: Element) => {
      let element;

      if (isReferenceLikeElement(item)) {
        element = this.toRefractedElement(['document', 'objects', 'Reference'], item);
        element.meta.set('referenced-element', 'operationTrait');
      } else {
        element = this.toRefractedElement(['document', 'objects', 'OperationTrait'], item);
      }

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default TraitsVisitor;
