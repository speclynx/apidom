import { always } from 'ramda';

import PulsarServerBindingElement from '../../../../../../elements/bindings/pulsar/PulsarServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type PulsarServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class PulsarServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: PulsarServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'pulsar', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: PulsarServerBindingVisitorOptions) {
    super(options);
    this.element = new PulsarServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'pulsar', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default PulsarServerBindingVisitor;
