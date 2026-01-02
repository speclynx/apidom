import { always } from 'ramda';

import WorkflowElement from '../../../../elements/Workflow.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface WorkflowVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class WorkflowVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: WorkflowElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Workflow']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: WorkflowVisitorOptions) {
    super(options);
    this.element = new WorkflowElement();
    this.specPath = always(['document', 'objects', 'Workflow']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default WorkflowVisitor;
