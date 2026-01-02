import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class StepParameters extends ArrayElement {
  static primaryClass = 'step-parameters';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(StepParameters.primaryClass);
    this.classes.push('parameters');
  }
}

export default StepParameters;
