import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import StepSuccessCriteriaElement from '../../../../elements/nces/StepSuccessCriteria.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';

/**
 * @public
 */
export interface SuccessCriteriaVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class SuccessCriteriaVisitor extends BaseSpecificationFallbackVisitor {
  declare public readonly element: StepSuccessCriteriaElement;

  constructor(options: SuccessCriteriaVisitorOptions) {
    super(options);
    this.element = new StepSuccessCriteriaElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'Criterion'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default SuccessCriteriaVisitor;
