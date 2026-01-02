import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Reference extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'reference';
    this.classes.push('openapi-reference');
  }

  get $ref(): StringElement | undefined {
    return this.get('$ref') as StringElement | undefined;
  }

  set $ref($ref: StringElement | undefined) {
    this.set('$ref', $ref);
  }
}

export default Reference;
