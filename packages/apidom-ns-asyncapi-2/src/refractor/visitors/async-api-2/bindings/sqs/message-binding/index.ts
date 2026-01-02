import { always } from 'ramda';

import SqsMessageBindingElement from '../../../../../../elements/bindings/sqs/SqsMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type SqsMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class SqsMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: SqsMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'sqs', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: SqsMessageBindingVisitorOptions) {
    super(options);
    this.element = new SqsMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'sqs', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default SqsMessageBindingVisitor;
