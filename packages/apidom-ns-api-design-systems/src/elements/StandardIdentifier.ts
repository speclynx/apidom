import { ArrayElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class StandardIdentifier extends ArrayElement {
  constructor(content?: string[], meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'standardIdentifier';
  }
}

export default StandardIdentifier;
