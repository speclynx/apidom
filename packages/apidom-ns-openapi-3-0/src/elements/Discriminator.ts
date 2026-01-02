import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Discriminator extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'discriminator';
  }

  get propertyName(): StringElement | undefined {
    return this.get('propertyName') as StringElement | undefined;
  }

  set propertyName(propertyName: StringElement | undefined) {
    this.set('propertyName', propertyName);
  }

  get mapping(): ObjectElement | undefined {
    return this.get('mapping') as ObjectElement | undefined;
  }

  set mapping(mapping: ObjectElement | undefined) {
    this.set('mapping', mapping);
  }
}

export default Discriminator;
