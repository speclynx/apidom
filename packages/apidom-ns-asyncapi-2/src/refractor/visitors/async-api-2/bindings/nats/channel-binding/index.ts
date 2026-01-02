import { always } from 'ramda';

import NatsChannelBindingElement from '../../../../../../elements/bindings/nats/NatsChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type NatsChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class NatsChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: NatsChannelBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'nats', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: NatsChannelBindingVisitorOptions) {
    super(options);
    this.element = new NatsChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'nats', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default NatsChannelBindingVisitor;
