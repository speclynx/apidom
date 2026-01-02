import { always } from 'ramda';

import StompMessageBindingElement from '../../../../../../elements/bindings/stomp/StompMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type StompMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class StompMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: StompMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'stomp', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: StompMessageBindingVisitorOptions) {
    super(options);
    this.element = new StompMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'stomp', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default StompMessageBindingVisitor;
