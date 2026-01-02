import { always } from 'ramda';

import MercureOperationBindingElement from '../../../../../../elements/bindings/mercure/MercureOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type MercureOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class MercureOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MercureOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'mercure', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: MercureOperationBindingVisitorOptions) {
    super(options);
    this.element = new MercureOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'mercure', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default MercureOperationBindingVisitor;
