import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

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
