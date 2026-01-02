import { always } from 'ramda';

import SolaceServerBindingElement from '../../../../../../elements/bindings/solace/SolaceServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type SolaceServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class SolaceServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: SolaceServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'solace', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: SolaceServerBindingVisitorOptions) {
    super(options);
    this.element = new SolaceServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'solace', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default SolaceServerBindingVisitor;
