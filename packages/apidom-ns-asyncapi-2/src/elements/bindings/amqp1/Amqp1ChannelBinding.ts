import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Amqp1ChannelBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'amqp1ChannelBinding';
    this.classes.push('channel-binding');
  }
}

export default Amqp1ChannelBinding;
