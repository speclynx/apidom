import { StringElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class DefaultContentType extends StringElement {
  constructor(content?: string, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'defaultContentType';
  }
}

export default DefaultContentType;
