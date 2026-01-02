import { always } from 'ramda';

import { SpecPath } from '../../generics/MapVisitor.ts';
import WorkflowOutputsElement from '../../../../elements/nces/WorkflowOutputs.ts';
import { BaseMapFallbackVisitor, BaseMapFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface OutputsVisitorOptions extends BaseMapFallbackVisitorOptions {}

/**
 * @public
 */
class OutputsVisitor extends BaseMapFallbackVisitor {
  declare public readonly element: WorkflowOutputsElement;

  declare protected readonly specPath: SpecPath<['value']>;

  constructor(options: OutputsVisitorOptions) {
    super(options);
    this.element = new WorkflowOutputsElement();
    this.specPath = always(['value']);
  }
}

export default OutputsVisitor;
