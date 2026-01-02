import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class SwaggerSchemes extends ArrayElement {
  static primaryClass = 'swagger-schemes';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(SwaggerSchemes.primaryClass);
  }
}

export default SwaggerSchemes;
