import { always } from 'ramda';

import AnypointmqMessageBindingElement from '../../../../../../elements/bindings/anypointmq/AnypointmqMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type AnypointmqMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class AnypointmqMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: AnypointmqMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'anypointmq', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: AnypointmqMessageBindingVisitorOptions) {
    super(options);
    this.element = new AnypointmqMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'anypointmq', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default AnypointmqMessageBindingVisitor;
