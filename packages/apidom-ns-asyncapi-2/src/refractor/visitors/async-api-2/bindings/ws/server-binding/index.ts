import { always } from 'ramda';

import WebSocketServerBindingElement from '../../../../../../elements/bindings/ws/WebSocketServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type WebSocketServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class WebSocketServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: WebSocketServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'ws', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: WebSocketServerBindingVisitorOptions) {
    super(options);
    this.element = new WebSocketServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'ws', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default WebSocketServerBindingVisitor;
