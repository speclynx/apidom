import {
  ObjectElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import ExternalDocumentationElement from './ExternalDocumentation.ts';

/**
 * @public
 */
class Tag extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'tag';
  }

  get name(): StringElement | undefined {
    return this.get('name') as StringElement | undefined;
  }

  set name(name: StringElement | undefined) {
    this.set('name', name);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get externalDocs(): ExternalDocumentationElement | undefined {
    return this.get('externalDocs') as ExternalDocumentationElement | undefined;
  }

  set externalDocs(externalDocs: ExternalDocumentationElement | undefined) {
    this.set('externalDocs', externalDocs);
  }
}

export default Tag;
