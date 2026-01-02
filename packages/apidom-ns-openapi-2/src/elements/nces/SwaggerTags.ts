import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class SwaggerTags extends ArrayElement {
  static primaryClass = 'swagger-tags';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(SwaggerTags.primaryClass);
  }
}

export default SwaggerTags;
