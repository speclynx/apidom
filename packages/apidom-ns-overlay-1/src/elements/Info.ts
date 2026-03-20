import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

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

  get version(): StringElement | undefined {
    return this.get('version') as StringElement | undefined;
  }

  set version(version: StringElement | undefined) {
    this.set('version', version);
  }
}

export default Info;
