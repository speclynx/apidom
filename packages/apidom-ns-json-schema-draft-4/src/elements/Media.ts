import { ObjectElement, StringElement, Attributes, Meta } from '@speclynx/apidom-datamodel';

import type { FixedField } from '../refractor/inspect.ts';

/**
 * URI: https://datatracker.ietf.org/doc/html/draft-wright-json-schema-hyperschema-00#section-4.3
 * @public
 */

class Media extends ObjectElement {
  declare static fixedFields: FixedField[];

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'media';
  }

  get binaryEncoding(): StringElement | undefined {
    return this.get('binaryEncoding') as StringElement | undefined;
  }

  set binaryEncoding(binaryEncoding: StringElement | undefined) {
    this.set('binaryEncoding', binaryEncoding);
  }

  get type(): StringElement | undefined {
    return this.get('type') as StringElement | undefined;
  }

  set type(type: StringElement | undefined) {
    this.set('type', type);
  }
}

export default Media;
