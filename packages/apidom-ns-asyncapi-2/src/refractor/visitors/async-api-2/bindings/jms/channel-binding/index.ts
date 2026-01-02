import { always } from 'ramda';

import JmsChannelBindingElement from '../../../../../../elements/bindings/jms/JmsChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type JmsChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class JmsChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: JmsChannelBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'jms', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: JmsChannelBindingVisitorOptions) {
    super(options);
    this.element = new JmsChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'jms', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default JmsChannelBindingVisitor;
