import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsOperationBindings extends ObjectElement {
  static primaryClass = 'components-operation-bindings';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsOperationBindings.primaryClass);
  }
}

export default ComponentsOperationBindings;
