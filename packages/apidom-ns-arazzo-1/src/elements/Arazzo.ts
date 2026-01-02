import { StringElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Arazzo extends StringElement {
  constructor(content?: string, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'arazzo';
    this.classes.push('spec-version');
    this.classes.push('version');
  }
}

export default Arazzo;
