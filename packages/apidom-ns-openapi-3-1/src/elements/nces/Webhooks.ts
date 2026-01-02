import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Webhooks extends ObjectElement {
  static primaryClass = 'webhooks';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(Webhooks.primaryClass);
  }
}

export default Webhooks;
