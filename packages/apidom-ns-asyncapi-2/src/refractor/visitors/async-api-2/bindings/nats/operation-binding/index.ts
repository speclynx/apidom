import { always } from 'ramda';

import NatsOperationBindingElement from '../../../../../../elements/bindings/nats/NatsOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type NatsOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class NatsOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: NatsOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'nats', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: NatsOperationBindingVisitorOptions) {
    super(options);
    this.element = new NatsOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'nats', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default NatsOperationBindingVisitor;
