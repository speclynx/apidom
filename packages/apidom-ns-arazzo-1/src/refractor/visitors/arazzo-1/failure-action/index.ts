import { always } from 'ramda';

import FailureActionElement from '../../../../elements/FailureAction.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface FailureActionVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class FailureActionVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: FailureActionElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'FailureAction']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: FailureActionVisitorOptions) {
    super(options);
    this.element = new FailureActionElement();
    this.specPath = always(['document', 'objects', 'FailureAction']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default FailureActionVisitor;
