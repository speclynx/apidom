import { always } from 'ramda';

import SolaceMessageBindingElement from '../../../../../../elements/bindings/solace/SolaceMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type SolaceMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class SolaceMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: SolaceMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'solace', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: SolaceMessageBindingVisitor) {
    super(options);
    this.element = new SolaceMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'solace', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default SolaceMessageBindingVisitor;
