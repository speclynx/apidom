import { ObjectElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class ResponseHeaders extends ObjectElement {
  static primaryClass = 'response-headers';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ResponseHeaders.primaryClass);
  }
}

export default ResponseHeaders;
