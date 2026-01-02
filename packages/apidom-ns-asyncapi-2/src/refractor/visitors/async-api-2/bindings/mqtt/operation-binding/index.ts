import { always } from 'ramda';

import MqttOperationBindingElement from '../../../../../../elements/bindings/mqtt/MqttOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type MqttOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class MqttOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MqttOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'mqtt', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: MqttOperationBindingVisitorOptions) {
    super(options);
    this.element = new MqttOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'mqtt', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default MqttOperationBindingVisitor;
