import { ArrayElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class WorkflowSuccessActions extends ArrayElement {
  static primaryClass = 'workflow-success-actions';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(WorkflowSuccessActions.primaryClass);
  }
}

export default WorkflowSuccessActions;
