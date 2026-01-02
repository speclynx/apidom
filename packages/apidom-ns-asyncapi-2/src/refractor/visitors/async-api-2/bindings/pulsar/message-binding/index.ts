import { always } from 'ramda';

import PulsarMessageBindingElement from '../../../../../../elements/bindings/pulsar/PulsarMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type PulsarMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class PulsarMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: PulsarMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'pulsar', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: PulsarMessageBindingVisitorOptions) {
    super(options);
    this.element = new PulsarMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'pulsar', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default PulsarMessageBindingVisitor;
