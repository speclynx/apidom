import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item: Element) => {
      const messageElement = this.toRefractedElement(
        ['document', 'objects', 'MessageExample'],
        item,
      );

      this.element.push(messageElement);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default ExamplesVisitor;
