import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class WorkflowOutputs extends ObjectElement {
  static primaryClass = 'workflow-outputs';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(WorkflowOutputs.primaryClass);
  }
}

export default WorkflowOutputs;
