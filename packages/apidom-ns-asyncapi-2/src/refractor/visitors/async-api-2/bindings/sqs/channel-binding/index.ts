import { always } from 'ramda';

import SqsChannelBindingElement from '../../../../../../elements/bindings/sqs/SqsChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type SqsChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class SqsChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: SqsChannelBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'sqs', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: SqsChannelBindingVisitorOptions) {
    super(options);
    this.element = new SqsChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'sqs', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default SqsChannelBindingVisitor;
