import { always } from 'ramda';

import SnsServerBindingElement from '../../../../../../elements/bindings/sns/SnsServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type SnsServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class SnsServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: SnsServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'sns', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: SnsServerBindingVisitorOptions) {
    super(options);
    this.element = new SnsServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'sns', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default SnsServerBindingVisitor;
