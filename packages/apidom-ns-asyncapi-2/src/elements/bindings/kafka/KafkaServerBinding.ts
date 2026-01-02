import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class KafkaServerBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'kafkaServerBinding';
    this.classes.push('server-binding');
  }

  get schemaRegistryUrl(): StringElement | undefined {
    return this.get('schemaRegistryUrl') as StringElement | undefined;
  }

  set schemaRegistryUrl(schemaRegistryUrl: StringElement | undefined) {
    this.set('schemaRegistryUrl', schemaRegistryUrl);
  }

  get schemaRegistryVendor(): StringElement | undefined {
    return this.get('schemaRegistryVendor') as StringElement | undefined;
  }

  set schemaRegistryVendor(schemaRegistryVendor: StringElement | undefined) {
    this.set('schemaRegistryVendor', schemaRegistryVendor);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default KafkaServerBinding;
