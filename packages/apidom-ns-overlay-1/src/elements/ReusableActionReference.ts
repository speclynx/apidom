import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ReusableActionReference extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'reusableActionReference';
  }

  get $ref(): StringElement | undefined {
    return this.get('$ref') as StringElement | undefined;
  }

  set $ref($ref: StringElement | undefined) {
    this.set('$ref', $ref);
  }

  get target(): StringElement | undefined {
    return this.get('target') as StringElement | undefined;
  }

  set target(target: StringElement | undefined) {
    this.set('target', target);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }
}

export default ReusableActionReference;
