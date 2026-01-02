import {
  ObjectElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class AnypointmqChannelBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'anypointmqChannelBinding';
    this.classes.push('channel-binding');
  }

  get destination(): StringElement | undefined {
    return this.get('destination') as StringElement | undefined;
  }

  set destination(destination: StringElement | undefined) {
    this.set('destination', destination);
  }

  get destinationType(): StringElement | undefined {
    return this.get('destinationType') as StringElement | undefined;
  }

  set destinationType(destinationType: StringElement | undefined) {
    this.set('destinationType', destinationType);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default AnypointmqChannelBinding;
