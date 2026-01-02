import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class WorkflowFailureActions extends ArrayElement {
  static primaryClass = 'workflow-failure-actions';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(WorkflowFailureActions.primaryClass);
  }
}

export default WorkflowFailureActions;
