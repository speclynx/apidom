import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ActionsElement from '../../../elements/nces/Actions.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from './bases.ts';

/**
 * @public
 */
export interface ActionsVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class ActionsVisitor extends BaseSpecificationFallbackVisitor {
  public readonly element: ActionsElement;

  constructor(options: ActionsVisitorOptions) {
    super(options);
    this.element = new ActionsElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'Action'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default ActionsVisitor;
