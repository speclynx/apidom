import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from '../bases.ts';
import MessageExamplesElement from '../../../../elements/nces/MessageExamples.ts';

/**
 * @public
 */
export type ExamplesVisitorOptions = BaseSpecificationVisitorOptions;

/**
 * @public
 */
class ExamplesVisitor extends BaseSpecificationVisitor {
  declare public readonly element: MessageExamplesElement;

  constructor(options: ExamplesVisitorOptions) {
    super(options);
    this.element = new MessageExamplesElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element) => {
      const messageElement = this.toRefractedElement(
        ['document', 'objects', 'MessageExample'],
        item,
      );

      this.element.push(messageElement);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default ExamplesVisitor;
