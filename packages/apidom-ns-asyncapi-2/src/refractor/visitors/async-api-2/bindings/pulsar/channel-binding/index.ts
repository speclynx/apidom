import { always } from 'ramda';

import PulsarChannelBindingElement from '../../../../../../elements/bindings/pulsar/PulsarChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type PulsarChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class PulsarChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'pulsar', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: PulsarChannelBindingVisitorOptions) {
    super(options);
    this.element = new PulsarChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'pulsar', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default PulsarChannelBindingVisitor;
