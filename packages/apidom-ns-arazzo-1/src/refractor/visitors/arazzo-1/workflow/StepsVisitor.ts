import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import WorkflowStepsElement from '../../../../elements/nces/WorkflowSteps.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';

/**
 * @public
 */
export interface StepsVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class StepsVisitor extends BaseSpecificationFallbackVisitor {
  declare public readonly element: WorkflowStepsElement;

  constructor(options: StepsVisitorOptions) {
    super(options);
    this.element = new WorkflowStepsElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'Step'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default StepsVisitor;
