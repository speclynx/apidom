import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class OperationCallbacks extends ObjectElement {
  static primaryClass = 'operation-callbacks';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(OperationCallbacks.primaryClass);
  }
}

export default OperationCallbacks;
