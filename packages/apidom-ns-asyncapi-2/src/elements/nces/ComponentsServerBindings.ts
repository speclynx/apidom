import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsServerBindings extends ObjectElement {
  static primaryClass = 'components-server-bindings';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsServerBindings.primaryClass);
  }
}

export default ComponentsServerBindings;
