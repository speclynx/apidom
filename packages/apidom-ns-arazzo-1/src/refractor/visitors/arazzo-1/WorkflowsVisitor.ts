import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import WorkflowsElement from '../../../elements/nces/Workflows.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from './bases.ts';

/**
 * @public
 */
export interface WorkflowsVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class WorkflowsVisitor extends BaseSpecificationFallbackVisitor {
  public readonly element: WorkflowsElement;

  constructor(options: WorkflowsVisitorOptions) {
    super(options);
    this.element = new WorkflowsElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'Workflow'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default WorkflowsVisitor;
