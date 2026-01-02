import { always } from 'ramda';

import Amqp1ServerBindingElement from '../../../../../../elements/bindings/amqp1/Amqp1ServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type Amqp1ServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class Amqp1ServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: Amqp1ServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'amqp1', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: Amqp1ServerBindingVisitorOptions) {
    super(options);
    this.element = new Amqp1ServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'amqp1', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default Amqp1ServerBindingVisitor;
