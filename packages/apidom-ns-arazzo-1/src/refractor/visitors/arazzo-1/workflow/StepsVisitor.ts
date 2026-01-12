import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'Step'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default StepsVisitor;
