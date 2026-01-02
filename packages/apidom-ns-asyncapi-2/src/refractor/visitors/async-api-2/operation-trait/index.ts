import { always } from 'ramda';

import OperationTraitElement from '../../../../elements/OperationTrait.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type OperationTraitVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class OperationTraitVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: OperationTraitElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'OperationTrait']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: OperationTraitVisitorOptions) {
    super(options);
    this.element = new OperationTraitElement();
    this.specPath = always(['document', 'objects', 'OperationTrait']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default OperationTraitVisitor;
