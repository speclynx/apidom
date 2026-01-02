import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ParameterContent extends ObjectElement {
  static primaryClass = 'parameter-content';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ParameterContent.primaryClass);
    this.classes.push('content');
  }
}

export default ParameterContent;
