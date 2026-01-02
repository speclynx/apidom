import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsServerVariables extends ObjectElement {
  static primaryClass = 'components-server-variables';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsServerVariables.primaryClass);
  }
}

export default ComponentsServerVariables;
