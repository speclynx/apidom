import { always } from 'ramda';

import AmqpOperationBindingElement from '../../../../../../elements/bindings/amqp/AmqpOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type AmqpOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class AmqpOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: AmqpOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'amqp', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: AmqpOperationBindingVisitorOptions) {
    super(options);
    this.element = new AmqpOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'amqp', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default AmqpOperationBindingVisitor;
