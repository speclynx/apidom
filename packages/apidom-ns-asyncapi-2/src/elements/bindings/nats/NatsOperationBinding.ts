import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class NatsOperationBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'natsOperationBinding';
    this.classes.push('operation-binding');
  }

  get queue(): StringElement | undefined {
    return this.get('queue') as StringElement | undefined;
  }

  set queue(queue: StringElement | undefined) {
    this.set('queue', queue);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default NatsOperationBinding;
