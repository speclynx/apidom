import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class OperationTraits extends ArrayElement {
  static primaryClass = 'operation-traits';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(OperationTraits.primaryClass);
  }
}

export default OperationTraits;
