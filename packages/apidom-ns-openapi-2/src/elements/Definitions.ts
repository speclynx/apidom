import { ObjectElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class Definitions extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'definitions';
  }
}

export default Definitions;
