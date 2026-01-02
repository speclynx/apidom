import {
  Element,
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class MessageExample extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'messageExample';
  }

  get headers(): ObjectElement | undefined {
    return this.get('headers') as ObjectElement | undefined;
  }

  set headers(headers: ObjectElement | undefined) {
    this.set('headers', headers);
  }

  get payload(): Element | undefined {
    return this.get('payload') as Element | undefined;
  }

  set payload(payload: Element | undefined) {
    this.set('payload', payload);
  }

  get name(): StringElement | undefined {
    return this.get('name') as StringElement | undefined;
  }

  set name(name: StringElement | undefined) {
    this.set('name', name);
  }

  get summary(): StringElement | undefined {
    return this.get('summary') as StringElement | undefined;
  }

  set summary(summary: StringElement | undefined) {
    this.set('summary', summary);
  }
}

export default MessageExample;
