import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ParameterExamples extends ObjectElement {
  static primaryClass = 'parameter-examples';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ParameterExamples.primaryClass);
    this.classes.push('examples');
  }
}

export default ParameterExamples;
