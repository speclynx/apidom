import { always } from 'ramda';

import MqttChannelBindingElement from '../../../../../../elements/bindings/mqtt/MqttChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type MqttChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class MqttChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MqttChannelBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'mqtt', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: MqttChannelBindingVisitorOptions) {
    super(options);
    this.element = new MqttChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'mqtt', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default MqttChannelBindingVisitor;
