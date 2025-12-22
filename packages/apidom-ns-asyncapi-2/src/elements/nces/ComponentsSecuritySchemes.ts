import { ObjectElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class ComponentsSecuritySchemes extends ObjectElement {
  static primaryClass = 'components-security-schemes';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsSecuritySchemes.primaryClass);
  }
}

export default ComponentsSecuritySchemes;
