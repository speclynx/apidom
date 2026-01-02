import { always } from 'ramda';

import { SpecPath } from '../../generics/MapVisitor.ts';
import StepOutputsElement from '../../../../elements/nces/StepOutputs.ts';
import { BaseMapFallbackVisitor, BaseMapFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface OutputsVisitorOptions extends BaseMapFallbackVisitorOptions {}

/**
 * @public
 */
class OutputsVisitor extends BaseMapFallbackVisitor {
  declare public readonly element: StepOutputsElement;

  declare protected readonly specPath: SpecPath<['value']>;

  constructor(options: OutputsVisitorOptions) {
    super(options);
    this.element = new StepOutputsElement();
    this.specPath = always(['value']);
  }
}

export default OutputsVisitor;
