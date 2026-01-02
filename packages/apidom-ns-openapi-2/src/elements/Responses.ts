import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

import ResponseElement from './Response.ts';
import ReferenceElement from './Reference.ts';

/**
 * @public
 */
class Responses extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'responses';
  }

  get default(): ResponseElement | ReferenceElement | undefined {
    return this.get('default') as ResponseElement | ReferenceElement | undefined;
  }

  set default(defaultValue: ResponseElement | ReferenceElement | undefined) {
    this.set('default', defaultValue);
  }
}

export default Responses;
