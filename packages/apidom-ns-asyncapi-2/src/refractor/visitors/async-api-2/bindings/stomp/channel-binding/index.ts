import { always } from 'ramda';

import StompChannelBindingElement from '../../../../../../elements/bindings/stomp/StompChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type StompChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class StompChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: StompChannelBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'stomp', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: StompChannelBindingVisitorOptions) {
    super(options);
    this.element = new StompChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'stomp', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default StompChannelBindingVisitor;
