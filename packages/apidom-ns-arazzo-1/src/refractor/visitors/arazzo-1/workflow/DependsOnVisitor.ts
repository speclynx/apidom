import { Mixin } from 'ts-mixer';
import { ArrayElement, Element, BREAK } from '@speclynx/apidom-core';

import WorkflowDependsOnElement from '../../../../elements/nces/WorkflowDependsOn.ts';
import SpecificationVisitor, { SpecificationVisitorOptions } from '../../SpecificationVisitor.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

/**
 * @public
 */
export interface WorkflowDependsOnVisitorOptions
  extends SpecificationVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class WorkflowDependsOnVisitor extends Mixin(SpecificationVisitor, FallbackVisitor) {
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
