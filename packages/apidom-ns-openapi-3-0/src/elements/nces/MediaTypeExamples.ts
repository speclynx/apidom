import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class MediaTypeExamples extends ObjectElement {
  static primaryClass = 'media-type-examples';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(MediaTypeExamples.primaryClass);
    this.classes.push('examples');
  }
}

export default MediaTypeExamples;
