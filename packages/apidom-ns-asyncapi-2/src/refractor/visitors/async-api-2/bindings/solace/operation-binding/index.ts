import { always } from 'ramda';

import SolaceOperationBindingElement from '../../../../../../elements/bindings/solace/SolaceOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type SolaceOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class SolaceOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: SolaceOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'solace', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: SolaceOperationBindingVisitorOptions) {
    super(options);
    this.element = new SolaceOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'solace', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default SolaceOperationBindingVisitor;
