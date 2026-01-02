import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class OperationTraitSecurity extends ArrayElement {
  static primaryClass = 'operation-trait-security';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(OperationTraitSecurity.primaryClass);
  }
}

export default OperationTraitSecurity;
