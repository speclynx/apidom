import { always } from 'ramda';

import IbmmqMessageBindingElement from '../../../../../../elements/bindings/ibmmq/IbmmqMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type IbmmqMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class IbmmqMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: IbmmqMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'ibmmq', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: IbmmqMessageBindingVisitorOptions) {
    super(options);
    this.element = new IbmmqMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'ibmmq', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default IbmmqMessageBindingVisitor;
