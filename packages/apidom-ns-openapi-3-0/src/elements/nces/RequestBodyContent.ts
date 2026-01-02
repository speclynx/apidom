import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class RequestBodyContent extends ObjectElement {
  static primaryClass = 'request-body-content';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(RequestBodyContent.primaryClass);
    this.classes.push('content');
  }
}

export default RequestBodyContent;
