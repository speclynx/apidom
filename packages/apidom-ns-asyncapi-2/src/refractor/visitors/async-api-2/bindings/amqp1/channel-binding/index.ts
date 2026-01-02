import { always } from 'ramda';

import Amqp1ChannelBindingElement from '../../../../../../elements/bindings/amqp1/Amqp1ChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type Amqp1ChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class Amqp1ChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: Amqp1ChannelBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'amqp1', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: Amqp1ChannelBindingVisitorOptions) {
    super(options);
    this.element = new Amqp1ChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'amqp1', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default Amqp1ChannelBindingVisitor;
