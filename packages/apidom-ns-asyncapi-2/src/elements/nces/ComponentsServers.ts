import { ObjectElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class ComponentsServers extends ObjectElement {
  static primaryClass = 'components-servers';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsServers.primaryClass);
  }
}

export default ComponentsServers;
