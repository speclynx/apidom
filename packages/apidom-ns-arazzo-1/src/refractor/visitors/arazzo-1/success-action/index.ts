import { always } from 'ramda';

import SuccessActionElement from '../../../../elements/SuccessAction.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface SuccessActionVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class SuccessActionVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: SuccessActionElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'SuccessAction']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: SuccessActionVisitorOptions) {
    super(options);
    this.element = new SuccessActionElement();
    this.specPath = always(['document', 'objects', 'SuccessAction']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default SuccessActionVisitor;
