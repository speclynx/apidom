import { always } from 'ramda';

import JmsOperationBindingElement from '../../../../../../elements/bindings/jms/JmsOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type JmsOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class JmsOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: JmsOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'jms', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: JmsOperationBindingVisitorOptions) {
    super(options);
    this.element = new JmsOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'jms', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default JmsOperationBindingVisitor;
