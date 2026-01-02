import { always } from 'ramda';

import Mqtt5ServerBindingElement from '../../../../../../elements/bindings/mqtt5/Mqtt5ServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type Mqtt5ServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class Mqtt5ServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: Mqtt5ServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'mqtt5', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: Mqtt5ServerBindingVisitorOptions) {
    super(options);
    this.element = new Mqtt5ServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'mqtt5', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default Mqtt5ServerBindingVisitor;
