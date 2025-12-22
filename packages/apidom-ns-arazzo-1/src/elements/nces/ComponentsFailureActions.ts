import { Attributes, Meta, ObjectElement } from '@speclynx/apidom-core';

/**
 * @public
 */
class ComponentsFailureActions extends ObjectElement {
  static primaryClass = 'components-failure-actions';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsFailureActions.primaryClass);
  }
}

export default ComponentsFailureActions;
