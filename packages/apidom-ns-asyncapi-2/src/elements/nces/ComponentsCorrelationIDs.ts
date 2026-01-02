import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ComponentsCorrelationIDs extends ObjectElement {
  static primaryClass = 'components-correlation-ids';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ComponentsCorrelationIDs.primaryClass);
  }
}

export default ComponentsCorrelationIDs;
