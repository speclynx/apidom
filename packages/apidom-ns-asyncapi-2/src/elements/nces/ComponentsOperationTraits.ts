import { ObjectElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class ComponentsOperationTraits extends ObjectElement {
  static primaryClass = 'components-operation-traits';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsOperationTraits.primaryClass);
  }
}

export default ComponentsOperationTraits;
