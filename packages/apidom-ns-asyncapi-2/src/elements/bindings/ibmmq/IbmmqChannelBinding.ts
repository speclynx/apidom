import {
  ObjectElement,
  StringElement,
  NumberElement,
  Attributes,
  Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class IbmmqChannelBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'ibmmqChannelBinding';
    this.classes.push('channel-binding');
  }

  get destinationType(): StringElement | undefined {
    return this.get('destinationType') as StringElement | undefined;
  }

  set destinationType(destinationType: StringElement | undefined) {
    this.set('destinationType', destinationType);
  }

  get queue(): ObjectElement | undefined {
    return this.get('queue') as ObjectElement | undefined;
  }

  set queue(queue: ObjectElement | undefined) {
    this.set('queue', queue);
  }

  get topic(): ObjectElement | undefined {
    return this.get('topic') as ObjectElement | undefined;
  }

  set topic(topic: ObjectElement | undefined) {
    this.set('topic', topic);
  }

  get maxMsgLength(): NumberElement | undefined {
    return this.get('maxMsgLength') as NumberElement | undefined;
  }

  set maxMsgLength(maxMsgLength: NumberElement | undefined) {
    this.set('maxMsgLength', maxMsgLength);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default IbmmqChannelBinding;
