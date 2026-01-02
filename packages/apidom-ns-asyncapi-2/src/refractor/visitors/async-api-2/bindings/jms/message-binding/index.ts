import { always } from 'ramda';

import JmsMessageBindingElement from '../../../../../../elements/bindings/jms/JmsMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type JmsMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class JmsMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: JmsMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'jms', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: JmsMessageBindingVisitorOptions) {
    super(options);
    this.element = new JmsMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'jms', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default JmsMessageBindingVisitor;
