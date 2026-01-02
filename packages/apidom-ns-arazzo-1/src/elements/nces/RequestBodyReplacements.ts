import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class RequestBodyReplacements extends ArrayElement {
  static primaryClass = 'request-body-replacements';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(RequestBodyReplacements.primaryClass);
  }
}

export default RequestBodyReplacements;
