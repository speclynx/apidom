import { SpecPath } from '../../generics/MapVisitor.ts';
import StepOutputsElement from '../../../../elements/nces/StepOutputs.ts';
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
  declare public readonly element: StepOutputsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Selector'] | ['value']>;

  constructor(options: OutputsVisitorOptions) {
    super(options);
    this.element = new StepOutputsElement();
    this.specPath = (element: unknown) =>
      isSelectorLikeElement(element) ? ['document', 'objects', 'Selector'] : ['value'];
  }
}

export default OutputsVisitor;
