import { always } from 'ramda';

import AnypointmqServerBindingElement from '../../../../../../elements/bindings/anypointmq/AnypointmqServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type AnypointmqServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class AnypointmqServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: AnypointmqServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'anypointmq', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: AnypointmqServerBindingVisitorOptions) {
    super(options);
    this.element = new AnypointmqServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'anypointmq', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default AnypointmqServerBindingVisitor;
