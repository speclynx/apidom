import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import WorkflowDependsOnElement from '../../../../elements/nces/WorkflowDependsOn.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';

/**
 * @public
 */
export interface WorkflowDependsOnVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class WorkflowDependsOnVisitor extends BaseSpecificationFallbackVisitor {
  public readonly element: WorkflowDependsOnElement;

  constructor(options: WorkflowDependsOnVisitorOptions) {
    super(options);
    this.element = new WorkflowDependsOnElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const specPath = ['value'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default WorkflowDependsOnVisitor;
