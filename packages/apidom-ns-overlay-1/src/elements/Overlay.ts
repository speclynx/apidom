import { StringElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Overlay extends StringElement {
  constructor(content?: string, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'overlay';
    this.classes.push('spec-version');
    this.classes.push('version');
  }
}

export default Overlay;
