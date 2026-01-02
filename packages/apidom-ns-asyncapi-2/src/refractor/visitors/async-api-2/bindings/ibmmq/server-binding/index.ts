import { always } from 'ramda';

import IbmmqServerBindingElement from '../../../../../../elements/bindings/ibmmq/IbmmqServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type IbmmqServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class IbmmqServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: IbmmqServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'ibmmq', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: IbmmqServerBindingVisitorOptions) {
    super(options);
    this.element = new IbmmqServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'ibmmq', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default IbmmqServerBindingVisitor;
