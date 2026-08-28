import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class FailureActionParameters extends ArrayElement {
  static primaryClass = 'failure-action-parameters';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(FailureActionParameters.primaryClass);
  }
}

export default FailureActionParameters;
