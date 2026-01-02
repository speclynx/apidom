import { always } from 'ramda';

import MqttMessageBindingElement from '../../../../../../elements/bindings/mqtt/MqttMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type MqttMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class MqttMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MqttMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'mqtt', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: MqttMessageBindingVisitorOptions) {
    super(options);
    this.element = new MqttMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'mqtt', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default MqttMessageBindingVisitor;
