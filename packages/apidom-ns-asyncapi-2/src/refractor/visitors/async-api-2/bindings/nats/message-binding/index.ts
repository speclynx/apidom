import { always } from 'ramda';

import NatsMessageBindingElement from '../../../../../../elements/bindings/nats/NatsMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type NatsMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class NatsMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: NatsMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'nats', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: NatsMessageBindingVisitorOptions) {
    super(options);
    this.element = new NatsMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'nats', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default NatsMessageBindingVisitor;
