import { always } from 'ramda';

import AmqpMessageBindingElement from '../../../../../../elements/bindings/amqp/AmqpMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type AmqpMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class AmqpMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: AmqpMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'amqp', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: AmqpMessageBindingVisitorOptions) {
    super(options);
    this.element = new AmqpMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'amqp', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default AmqpMessageBindingVisitor;
