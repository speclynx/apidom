import { always } from 'ramda';

import WebSocketOperationBindingElement from '../../../../../../elements/bindings/ws/WebSocketOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type WebSocketOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class WebSocketOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: WebSocketOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'ws', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: WebSocketOperationBindingVisitor) {
    super(options);
    this.element = new WebSocketOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'ws', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default WebSocketOperationBindingVisitor;
