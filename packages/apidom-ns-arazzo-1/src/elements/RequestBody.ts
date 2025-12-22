import { Element, StringElement, ObjectElement, Attributes, Meta } from '@speclynx/apidom-core';

import RequestBodyReplacementsElement from './nces/RequestBodyReplacements.ts';

/**
 * @public
 */
class RequestBody extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'requestBody';
  }

  get contentType(): StringElement | undefined {
    return this.get('contentType');
  }

  set contentType(contentType: StringElement | undefined) {
    this.set('contentType', contentType);
  }

  get payload(): Element | undefined {
    return this.get('payload');
  }

  set payload(payload: Element | undefined) {
    this.set('payload', payload);
  }

  get replacements(): RequestBodyReplacementsElement | undefined {
    return this.get('replacements');
  }

  set replacements(replacements: RequestBodyReplacementsElement | undefined) {
    this.set('replacements', replacements);
  }
}

export default RequestBody;
