import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class GooglepubsubChannelBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'googlepubsubChannelBinding';
    this.classes.push('channel-binding');
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }

  get labels(): ObjectElement | undefined {
    return this.get('labels') as ObjectElement | undefined;
  }

  set labels(labels: ObjectElement | undefined) {
    this.set('labels', labels);
  }

  get messageRetentionDuration(): StringElement | undefined {
    return this.get('messageRetentionDuration') as StringElement | undefined;
  }

  set messageRetentionDuration(messageRetentionDuration: StringElement | undefined) {
    this.set('messageRetentionDuration', messageRetentionDuration);
  }

  get messageStoragePolicy(): ObjectElement | undefined {
    return this.get('messageStoragePolicy') as ObjectElement | undefined;
  }

  set messageStoragePolicy(messageStoragePolicy: ObjectElement | undefined) {
    this.set('messageStoragePolicy', messageStoragePolicy);
  }

  get schemaSettings(): ObjectElement | undefined {
    return this.get('schemaSettings') as ObjectElement | undefined;
  }

  set schemaSettings(schemaSettings: ObjectElement | undefined) {
    this.set('schemaSettings', schemaSettings);
  }

  get topic(): StringElement | undefined {
    return this.get('topic') as StringElement | undefined;
  }

  set topic(topic: StringElement | undefined) {
    this.set('topic', topic);
  }
}

export default GooglepubsubChannelBinding;
