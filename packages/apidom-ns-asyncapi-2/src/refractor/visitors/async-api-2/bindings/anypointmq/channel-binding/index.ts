import { always } from 'ramda';

import AnypointmqChannelBindingElement from '../../../../../../elements/bindings/anypointmq/AnypointmqChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type AnypointmqChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class AnypointmqChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: AnypointmqChannelBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'anypointmq', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: AnypointmqChannelBindingVisitorOptions) {
    super(options);
    this.element = new AnypointmqChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'anypointmq', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default AnypointmqChannelBindingVisitor;
