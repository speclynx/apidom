import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class DiscriminatorMapping extends ObjectElement {
  static primaryClass = 'discriminator-mapping';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(DiscriminatorMapping.primaryClass);
  }
}

export default DiscriminatorMapping;
