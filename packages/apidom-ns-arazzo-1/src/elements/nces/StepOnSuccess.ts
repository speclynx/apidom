import { ArrayElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class StepOnSuccess extends ArrayElement {
  static primaryClass = 'step-on-success';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(StepOnSuccess.primaryClass);
  }
}

export default StepOnSuccess;
