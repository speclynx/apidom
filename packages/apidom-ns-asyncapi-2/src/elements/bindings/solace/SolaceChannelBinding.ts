import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class SolaceChannelBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'solaceChannelBinding';
    this.classes.push('channel-binding');
  }
}

export default SolaceChannelBinding;
