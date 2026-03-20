import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Actions extends ArrayElement {
  static primaryClass = 'actions';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(Actions.primaryClass);
  }
}

export default Actions;
