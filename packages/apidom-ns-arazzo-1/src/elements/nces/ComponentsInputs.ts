import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsInputs extends ObjectElement {
  static primaryClass = 'components-inputs';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsInputs.primaryClass);
  }
}

export default ComponentsInputs;
