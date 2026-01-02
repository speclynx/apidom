import {
  StringElement,
  ObjectElement,
  BooleanElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Xml extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'xml';
  }

  get name(): StringElement | undefined {
    return this.get('name') as StringElement | undefined;
  }

  set name(name: StringElement | undefined) {
    this.set('name', name);
  }

  get namespace(): StringElement | undefined {
    return this.get('namespace') as StringElement | undefined;
  }

  set namespace(namespace: StringElement | undefined) {
    this.set('namespace', namespace);
  }

  get prefix(): StringElement | undefined {
    return this.get('prefix') as StringElement | undefined;
  }

  set prefix(prefix: StringElement | undefined) {
    this.set('prefix', prefix);
  }

  get attribute(): BooleanElement | undefined {
    return this.get('attribute') as BooleanElement | undefined;
  }

  set attribute(attribute: BooleanElement | undefined) {
    this.set('attribute', attribute);
  }

  get wrapped(): BooleanElement | undefined {
    return this.get('wrapped') as BooleanElement | undefined;
  }

  set wrapped(wrapped: BooleanElement | undefined) {
    this.set('wrapped', wrapped);
  }
}

export default Xml;
