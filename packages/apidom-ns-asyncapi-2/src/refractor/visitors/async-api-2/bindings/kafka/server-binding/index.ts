import { always } from 'ramda';

import KafkaServerBindingElement from '../../../../../../elements/bindings/kafka/KafkaServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type KafkaServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class KafkaServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: KafkaServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'kafka', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: KafkaServerBindingVisitorOptions) {
    super(options);
    this.element = new KafkaServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'kafka', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default KafkaServerBindingVisitor;
