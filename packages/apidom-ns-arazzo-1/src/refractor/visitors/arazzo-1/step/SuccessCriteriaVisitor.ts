import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

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

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'Criterion'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default SuccessCriteriaVisitor;
