import { always } from 'ramda';

import SqsOperationBindingElement from '../../../../../../elements/bindings/sqs/SqsOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type SqsOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class SqsOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: SqsOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'sqs', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: SqsOperationBindingVisitorOptions) {
    super(options);
    this.element = new SqsOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'sqs', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default SqsOperationBindingVisitor;
