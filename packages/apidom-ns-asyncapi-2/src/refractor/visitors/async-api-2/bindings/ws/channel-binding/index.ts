import { always } from 'ramda';

import WebSocketChannelBindingElement from '../../../../../../elements/bindings/ws/WebSocketChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type WebSocketChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class WebSocketChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: WebSocketChannelBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'ws', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: WebSocketChannelBindingVisitorOptions) {
    super(options);
    this.element = new WebSocketChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'ws', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default WebSocketChannelBindingVisitor;
