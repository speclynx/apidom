import { always } from 'ramda';

import Mqtt5OperationBindingElement from '../../../../../../elements/bindings/mqtt5/Mqtt5OperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type Mqtt5OperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class Mqtt5OperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: Mqtt5OperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'mqtt5', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: Mqtt5OperationBindingVisitorOptions) {
    super(options);
    this.element = new Mqtt5OperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'mqtt5', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default Mqtt5OperationBindingVisitor;
