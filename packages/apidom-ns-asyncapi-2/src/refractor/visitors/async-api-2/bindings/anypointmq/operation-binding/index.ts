import { always } from 'ramda';

import AnypointmqOperationBindingElement from '../../../../../../elements/bindings/anypointmq/AnypointmqOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type AnypointmqOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class AnypointmqOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: AnypointmqOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'anypointmq', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: AnypointmqOperationBindingVisitorOptions) {
    super(options);
    this.element = new AnypointmqOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'anypointmq', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default AnypointmqOperationBindingVisitor;
