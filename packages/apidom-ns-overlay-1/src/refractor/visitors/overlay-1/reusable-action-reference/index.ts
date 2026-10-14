import { always } from 'ramda';

import ReusableActionReferenceElement from '../../../../elements/ReusableActionReference.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface ReusableActionReferenceVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class ReusableActionReferenceVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: ReusableActionReferenceElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ReusableActionReference']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ReusableActionReferenceVisitorOptions) {
    super(options);
    this.element = new ReusableActionReferenceElement();
    this.specPath = always(['document', 'objects', 'ReusableActionReference']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ReusableActionReferenceVisitor;
