import { ObjectElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class ComponentsSuccessActions extends ObjectElement {
  static primaryClass = 'components-success-actions';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsSuccessActions.primaryClass);
  }
}

export default ComponentsSuccessActions;
