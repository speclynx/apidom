import { always } from 'ramda';

import KafkaOperationBindingElement from '../../../../../../elements/bindings/kafka/KafkaOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type KafkaOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class KafkaOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: KafkaOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'kafka', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: KafkaOperationBindingVisitorOptions) {
    super(options);
    this.element = new KafkaOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'kafka', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default KafkaOperationBindingVisitor;
