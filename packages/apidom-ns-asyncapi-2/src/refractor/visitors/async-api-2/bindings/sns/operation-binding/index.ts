import { always } from 'ramda';

import SnsOperationBindingElement from '../../../../../../elements/bindings/sns/SnsOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type SnsOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class SnsOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: SnsOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'sns', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: SnsOperationBindingVisitorOptions) {
    super(options);
    this.element = new SnsOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'sns', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default SnsOperationBindingVisitor;
