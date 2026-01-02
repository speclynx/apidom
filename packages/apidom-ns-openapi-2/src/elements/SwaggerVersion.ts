import { StringElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class SwaggerVersion extends StringElement {
  constructor(content?: string, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'swaggerVersion';
    this.classes.push('spec-version');
    this.classes.push('version');
  }
}

export default SwaggerVersion;
