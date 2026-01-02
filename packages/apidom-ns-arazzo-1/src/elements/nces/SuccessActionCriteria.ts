import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class SuccessActionCriteria extends ArrayElement {
  static primaryClass = 'success-action-criteria';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(SuccessActionCriteria.primaryClass);
    this.classes.push('criteria');
  }
}

export default SuccessActionCriteria;
