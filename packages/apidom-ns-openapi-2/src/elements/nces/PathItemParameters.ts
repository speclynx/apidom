import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class PathItemParameters extends ArrayElement {
  static primaryClass = 'path-item-parameters';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(PathItemParameters.primaryClass);
    this.classes.push('parameters');
  }
}

export default PathItemParameters;
