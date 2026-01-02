import { always } from 'ramda';

import Amqp1MessageBindingElement from '../../../../../../elements/bindings/amqp1/Amqp1MessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type Amqp1MessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class Amqp1MessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: Amqp1MessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'amqp1', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: Amqp1MessageBindingVisitorOptions) {
    super(options);
    this.element = new Amqp1MessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'amqp1', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default Amqp1MessageBindingVisitor;
