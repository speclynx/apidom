import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsCallbacks extends ObjectElement {
  static primaryClass = 'components-callbacks';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsCallbacks.primaryClass);
  }
}

export default ComponentsCallbacks;
