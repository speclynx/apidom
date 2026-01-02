import { always } from 'ramda';

import Mqtt5MessageBindingElement from '../../../../../../elements/bindings/mqtt5/Mqtt5MessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type Mqtt5MessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class Mqtt5MessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: Mqtt5MessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'mqtt5', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: Mqtt5MessageBindingVisitorOptions) {
    super(options);
    this.element = new Mqtt5MessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'mqtt5', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default Mqtt5MessageBindingVisitor;
