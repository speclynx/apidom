import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsChannelBindings extends ObjectElement {
  static primaryClass = 'components-channel-bindings';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsChannelBindings.primaryClass);
  }
}

export default ComponentsChannelBindings;
