import { always } from 'ramda';

import MercureServerBindingElement from '../../../../../../elements/bindings/mercure/MercureServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type MercureServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class MercureServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MercureServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'mercure', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: MercureServerBindingVisitorOptions) {
    super(options);
    this.element = new MercureServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'mercure', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default MercureServerBindingVisitor;
