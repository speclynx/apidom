import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class SwaggerConsumes extends ArrayElement {
  static primaryClass = 'swagger-consumes';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(SwaggerConsumes.primaryClass);
  }
}

export default SwaggerConsumes;
