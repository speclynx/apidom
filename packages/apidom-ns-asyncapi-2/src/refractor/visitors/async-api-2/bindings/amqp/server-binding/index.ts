import { always } from 'ramda';

import AmqpServerBindingElement from '../../../../../../elements/bindings/amqp/AmqpServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type AmqpServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class AmqpServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: AmqpServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'amqp', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: AmqpServerBindingVisitorOptions) {
    super(options);
    this.element = new AmqpServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'amqp', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default AmqpServerBindingVisitor;
