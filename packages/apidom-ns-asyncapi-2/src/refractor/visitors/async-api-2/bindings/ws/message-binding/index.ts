import { always } from 'ramda';

import WebSocketMessageBindingElement from '../../../../../../elements/bindings/ws/WebSocketMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type WebSocketMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class WebSocketMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: WebSocketMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'ws', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: WebSocketMessageBindingVisitorOptions) {
    super(options);
    this.element = new WebSocketMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'ws', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default WebSocketMessageBindingVisitor;
