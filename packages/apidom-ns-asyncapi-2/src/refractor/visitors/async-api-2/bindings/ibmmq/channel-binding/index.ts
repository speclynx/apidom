import { always } from 'ramda';

import IbmmqChannelBindingElement from '../../../../../../elements/bindings/ibmmq/IbmmqChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type IbmmqChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class IbmmqChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: IbmmqChannelBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'ibmmq', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: IbmmqChannelBindingVisitorOptions) {
    super(options);
    this.element = new IbmmqChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'ibmmq', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default IbmmqChannelBindingVisitor;
