import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class OperationConsumes extends ArrayElement {
  static primaryClass = 'operation-consumes';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(OperationConsumes.primaryClass);
  }
}

export default OperationConsumes;
