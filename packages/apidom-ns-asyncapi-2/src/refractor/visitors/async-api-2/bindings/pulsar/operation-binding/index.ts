import { always } from 'ramda';

import PulsarOperationBindingElement from '../../../../../../elements/bindings/pulsar/PulsarOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type PulsarOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class PulsarOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: PulsarOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'pulsar', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: PulsarOperationBindingVisitorOptions) {
    super(options);
    this.element = new PulsarOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'pulsar', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default PulsarOperationBindingVisitor;
