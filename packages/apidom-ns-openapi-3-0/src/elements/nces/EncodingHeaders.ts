import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class EncodingHeaders extends ObjectElement {
  static primaryClass = 'encoding-headers';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(EncodingHeaders.primaryClass);
  }
}

export default EncodingHeaders;
