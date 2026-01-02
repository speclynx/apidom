import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from '../bases.ts';
import MessageTraitExamplesElement from '../../../../elements/nces/MessageTraitExamples.ts';

/**
 * @public
 */
export type ExamplesVisitorOptions = BaseSpecificationVisitorOptions;

/**
 * @public
 */
class ExamplesVisitor extends BaseSpecificationVisitor {
  declare public readonly element: MessageTraitExamplesElement;

  constructor(options: ExamplesVisitorOptions) {
    super(options);
    this.element = new MessageTraitExamplesElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element) => {
      const messageExampleElement = this.toRefractedElement(
        ['document', 'objects', 'MessageExample'],
        item,
      );

      this.element.push(messageExampleElement);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default ExamplesVisitor;
