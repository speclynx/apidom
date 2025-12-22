import { ArrayElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class Security extends ArrayElement {
  static primaryClass = 'security';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(Security.primaryClass);
  }
}

export default Security;
