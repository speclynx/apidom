import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Workflows extends ArrayElement {
  static primaryClass = 'workflows';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(Workflows.primaryClass);
  }
}

export default Workflows;
