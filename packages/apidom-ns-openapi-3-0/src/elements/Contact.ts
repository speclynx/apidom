import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Contact extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'contact';
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

  get email(): StringElement | undefined {
    return this.get('email') as StringElement | undefined;
  }

  set email(email: StringElement | undefined) {
    this.set('email', email);
  }
}

export default Contact;
