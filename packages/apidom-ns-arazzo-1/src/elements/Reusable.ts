import { StringElement, ObjectElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class Reusable extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'reusable';
    this.classes.push('arazzo-reference');
  }

  get reference(): StringElement | undefined {
    return this.get('reference');
  }

  set reference(reference: StringElement | undefined) {
    this.set('reference', reference);
  }

  get value(): StringElement | undefined {
    return this.get('value');
  }

  set value(value: StringElement | undefined) {
    this.set('value', value);
  }
}

export default Reusable;
