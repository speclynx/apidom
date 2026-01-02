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
class IbmmqMessageBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'ibmmqMessageBinding';
    this.classes.push('message-binding');
  }

  get type(): StringElement | undefined {
    return this.get('type') as StringElement | undefined;
  }

  set type(type: StringElement | undefined) {
    this.set('type', type);
  }

  get headers(): StringElement | undefined {
    return this.get('headers') as StringElement | undefined;
  }

  set headers(headers: StringElement | undefined) {
    this.set('headers', headers);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get expiry(): NumberElement | undefined {
    return this.get('expiry') as NumberElement | undefined;
  }

  set expiry(expiry: NumberElement | undefined) {
    this.set('expiry', expiry);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default IbmmqMessageBinding;
