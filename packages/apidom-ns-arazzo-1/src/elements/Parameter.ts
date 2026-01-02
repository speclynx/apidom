import {
  ObjectElement,
  StringElement,
  Element,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Parameter extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'parameter';
  }

  get name(): StringElement | undefined {
    return this.get('name') as StringElement | undefined;
  }

  set name(name: StringElement | undefined) {
    this.set('name', name);
  }

  get in(): StringElement | undefined {
    return this.get('in') as StringElement | undefined;
  }

  set in(val: StringElement | undefined) {
    this.set('in', val);
  }

  get value(): Element | undefined {
    return this.get('value') as Element | undefined;
  }

  set value(value: Element | undefined) {
    this.set('value', value);
  }
}

export default Parameter;
