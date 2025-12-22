import { ArrayElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class WorkflowDependsOn extends ArrayElement {
  static primaryClass = 'workflow-depends-on';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(WorkflowDependsOn.primaryClass);
  }
}

export default WorkflowDependsOn;
