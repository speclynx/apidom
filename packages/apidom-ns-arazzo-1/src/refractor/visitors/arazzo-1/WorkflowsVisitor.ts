import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'Workflow'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default WorkflowsVisitor;
