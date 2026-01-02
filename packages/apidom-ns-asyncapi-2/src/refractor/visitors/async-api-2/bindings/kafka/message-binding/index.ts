import { always } from 'ramda';

import KafkaMessageBindingElement from '../../../../../../elements/bindings/kafka/KafkaMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type KafkaMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class KafkaMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: KafkaMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'kafka', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: KafkaMessageBindingVisitorOptions) {
    super(options);
    this.element = new KafkaMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'kafka', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default KafkaMessageBindingVisitor;
