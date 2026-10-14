import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsActions extends ObjectElement {
  static primaryClass = 'components-actions';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsActions.primaryClass);
  }
}

export default ComponentsActions;
