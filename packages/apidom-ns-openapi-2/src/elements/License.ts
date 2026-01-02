import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class License extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'license';
  }

  get name(): StringElement | undefined {
    return this.get('name') as StringElement | undefined;
  }

  set name(name: StringElement | undefined) {
    this.set('name', name);
  }

  get url(): StringElement | undefined {
    return this.get('url') as StringElement | undefined;
  }

  set url(url: StringElement | undefined) {
    this.set('url', url);
  }
}

export default License;
