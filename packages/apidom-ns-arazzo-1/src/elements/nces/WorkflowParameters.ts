import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class WorkflowParameters extends ArrayElement {
  static primaryClass = 'workflow-parameters';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(WorkflowParameters.primaryClass);
    this.classes.push('parameters');
  }
}

export default WorkflowParameters;
