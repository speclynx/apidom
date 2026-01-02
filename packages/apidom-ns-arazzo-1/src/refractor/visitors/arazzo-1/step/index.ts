import { always } from 'ramda';

import StepElement from '../../../../elements/Step.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface StepVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class StepVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: StepElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Step']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: StepVisitorOptions) {
    super(options);
    this.element = new StepElement();
    this.specPath = always(['document', 'objects', 'Step']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default StepVisitor;
