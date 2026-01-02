import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class StepSuccessCriteria extends ArrayElement {
  static primaryClass = 'step-success-criteria';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(StepSuccessCriteria.primaryClass);
    this.classes.push('criteria');
  }
}

export default StepSuccessCriteria;
