import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsPathItems extends ObjectElement {
  static primaryClass = 'components-path-items';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsPathItems.primaryClass);
  }
}

export default ComponentsPathItems;
