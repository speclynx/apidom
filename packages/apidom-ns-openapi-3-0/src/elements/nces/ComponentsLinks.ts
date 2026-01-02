import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsLinks extends ObjectElement {
  static primaryClass = 'components-links';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsLinks.primaryClass);
  }
}

export default ComponentsLinks;
