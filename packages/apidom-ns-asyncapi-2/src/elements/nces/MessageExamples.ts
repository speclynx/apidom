import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class MessageExamples extends ArrayElement {
  static primaryClass = 'message-examples';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(MessageExamples.primaryClass);
  }
}

export default MessageExamples;
