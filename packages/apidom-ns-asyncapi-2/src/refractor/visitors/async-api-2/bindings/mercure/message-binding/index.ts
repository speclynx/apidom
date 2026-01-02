import { always } from 'ramda';

import MercureMessageBindingElement from '../../../../../../elements/bindings/mercure/MercureMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type MercureMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class MercureMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MercureMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'mercure', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: MercureMessageBindingVisitorOptions) {
    super(options);
    this.element = new MercureMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'mercure', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default MercureMessageBindingVisitor;
