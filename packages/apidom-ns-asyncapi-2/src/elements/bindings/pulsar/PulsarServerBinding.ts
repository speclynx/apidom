import {
  ObjectElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class PulsarServerBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'pulsarServerBinding';
    this.classes.push('server-binding');
  }

  get tenant(): StringElement | undefined {
    return this.get('tenant') as StringElement | undefined;
  }

  set tenant(tenant: StringElement | undefined) {
    this.set('tenant', tenant);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default PulsarServerBinding;
