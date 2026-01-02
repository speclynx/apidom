import { always } from 'ramda';

import MqttServerBindingElement from '../../../../../../elements/bindings/mqtt/MqttServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type MqttServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class MqttServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MqttServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'mqtt', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: MqttServerBindingVisitorOptions) {
    super(options);
    this.element = new MqttServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'mqtt', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default MqttServerBindingVisitor;
