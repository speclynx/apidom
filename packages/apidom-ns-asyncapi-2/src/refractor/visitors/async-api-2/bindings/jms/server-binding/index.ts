import { always } from 'ramda';

import JmsServerBindingElement from '../../../../../../elements/bindings/jms/JmsServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type JmsServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class JmsServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: JmsServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'jms', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: JmsServerBindingVisitorOptions) {
    super(options);
    this.element = new JmsServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'jms', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default JmsServerBindingVisitor;
