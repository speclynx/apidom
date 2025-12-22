import { ArrayElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class SourceDescriptions extends ArrayElement {
  static primaryClass = 'source-descriptions';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(SourceDescriptions.primaryClass);
  }
}

export default SourceDescriptions;
