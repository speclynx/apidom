import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import ContactElement from './Contact.ts';
import LicenseElement from './License.ts';

/**
 * @public
 */
class Info extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'info';
    this.classes.push('info');
  }

  get title(): StringElement | undefined {
    return this.get('title') as StringElement | undefined;
  }

  set title(title: StringElement | undefined) {
    this.set('title', title);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get termsOfService(): StringElement | undefined {
    return this.get('termsOfService') as StringElement | undefined;
  }

  set termsOfService(tos: StringElement | undefined) {
    this.set('termsOfService', tos);
  }

  get version(): StringElement | undefined {
    return this.get('version') as StringElement | undefined;
  }

  set version(version: StringElement | undefined) {
    this.set('version', version);
  }

  get license(): LicenseElement | undefined {
    return this.get('license') as LicenseElement | undefined;
  }

  set license(licenseElement: LicenseElement | undefined) {
    this.set('license', licenseElement);
  }

  get contact(): ContactElement | undefined {
    return this.get('contact') as ContactElement | undefined;
  }

  set contact(contactElement: ContactElement | undefined) {
    this.set('contact', contactElement);
  }
}

export default Info;
