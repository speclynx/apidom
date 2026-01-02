import { always } from 'ramda';

import StompOperationBindingElement from '../../../../../../elements/bindings/stomp/StompOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type StompOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class StompOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: StompOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'stomp', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: StompOperationBindingVisitorOptions) {
    super(options);
    this.element = new StompOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'stomp', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default StompOperationBindingVisitor;
