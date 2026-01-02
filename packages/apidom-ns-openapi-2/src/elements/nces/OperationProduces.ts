import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class OperationProduces extends ArrayElement {
  static primaryClass = 'operation-produces';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(OperationProduces.primaryClass);
  }
}

export default OperationProduces;
