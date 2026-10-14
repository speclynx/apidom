import { always } from 'ramda';

import ReusableActionElement from '../../../../elements/ReusableAction.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface ReusableActionVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class ReusableActionVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: ReusableActionElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ReusableAction']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ReusableActionVisitorOptions) {
    super(options);
    this.element = new ReusableActionElement();
    this.specPath = always(['document', 'objects', 'ReusableAction']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ReusableActionVisitor;
