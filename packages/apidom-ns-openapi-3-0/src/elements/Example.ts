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
class Example extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'example';
  }

  get summary(): StringElement | undefined {
    return this.get('summary') as StringElement | undefined;
  }

  set summary(summary: StringElement | undefined) {
    this.set('summary', summary);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get value(): Element | undefined {
    return this.get('value') as Element | undefined;
  }

  set value(value: Element | undefined) {
    this.set('value', value);
  }

  get externalValue(): StringElement | undefined {
    return this.get('externalValue') as StringElement | undefined;
  }

  set externalValue(externalValue: StringElement | undefined) {
    this.set('externalValue', externalValue);
  }
}

export default Example;
