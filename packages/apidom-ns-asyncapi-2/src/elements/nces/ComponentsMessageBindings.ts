import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsMessageBindings extends ObjectElement {
  static primaryClass = 'components-message-bindings';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsMessageBindings.primaryClass);
  }
}

export default ComponentsMessageBindings;
