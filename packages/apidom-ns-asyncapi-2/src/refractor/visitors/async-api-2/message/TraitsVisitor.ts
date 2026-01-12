import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from '../bases.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import MessageTraitsElement from '../../../../elements/nces/MessageTraits.ts';

/**
 * @public
 */
export type TraitsVisitorOptions = BaseSpecificationVisitorOptions;

/**
 * @public
 */
class TraitsVisitor extends BaseSpecificationVisitor {
  declare public readonly element: MessageTraitsElement;

  constructor(options: TraitsVisitorOptions) {
    super(options);
    this.element = new MessageTraitsElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item: Element) => {
      let element;

      if (isReferenceLikeElement(item)) {
        element = this.toRefractedElement(['document', 'objects', 'Reference'], item);
        element.meta.set('referenced-element', 'messageTrait');
      } else {
        element = this.toRefractedElement(['document', 'objects', 'MessageTrait'], item);
      }

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default TraitsVisitor;
