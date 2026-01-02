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
class PayloadReplacement extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'payloadReplacement';
  }

  get target(): StringElement | undefined {
    return this.get('target') as StringElement | undefined;
  }

  set target(target: StringElement | undefined) {
    this.set('target', target);
  }

  get value(): Element | undefined {
    return this.get('value') as Element | undefined;
  }

  set value(value: Element | undefined) {
    this.set('value', value);
  }
}

export default PayloadReplacement;
