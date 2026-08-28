import { SpecPath } from '../../generics/MapVisitor.ts';
import WorkflowOutputsElement from '../../../../elements/nces/WorkflowOutputs.ts';
import { BaseMapFallbackVisitor, BaseMapFallbackVisitorOptions } from '../bases.ts';
import { isSelectorLikeElement } from '../../../predicates.ts';

/**
 * @public
 */
export interface OutputsVisitorOptions extends BaseMapFallbackVisitorOptions {}

/**
 * @public
 */
class OutputsVisitor extends BaseMapFallbackVisitor {
  declare public readonly element: WorkflowOutputsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Selector'] | ['value']>;

  constructor(options: OutputsVisitorOptions) {
    super(options);
    this.element = new WorkflowOutputsElement();
    this.specPath = (element: unknown) =>
      isSelectorLikeElement(element) ? ['document', 'objects', 'Selector'] : ['value'];
  }
}

export default OutputsVisitor;
