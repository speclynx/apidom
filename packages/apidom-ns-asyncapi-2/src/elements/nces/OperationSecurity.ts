import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class OperationSecurity extends ArrayElement {
  static primaryClass = 'operation-security';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(OperationSecurity.primaryClass);
  }
}

export default OperationSecurity;
