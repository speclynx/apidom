import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsMessageTraits extends ObjectElement {
  static primaryClass = 'components-message-traits';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsMessageTraits.primaryClass);
  }
}

export default ComponentsMessageTraits;
