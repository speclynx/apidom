import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import SchemaElement from '../../Schema.ts';
import ReferenceElement from '../../Reference.ts';

/**
 * @public
 */
class HttpOperationBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'httpOperationBinding';
    this.classes.push('operation-binding');
  }

  get type(): StringElement | undefined {
    return this.get('type') as StringElement | undefined;
  }

  set type(type: StringElement | undefined) {
    this.set('type', type);
  }

  get method(): StringElement | undefined {
    return this.get('method') as StringElement | undefined;
  }

  set method(method: StringElement | undefined) {
    this.set('method', method);
  }

  get query(): SchemaElement | ReferenceElement | undefined {
    return this.get('query') as SchemaElement | ReferenceElement | undefined;
  }

  set query(query: SchemaElement | ReferenceElement | undefined) {
    this.set('query', query);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default HttpOperationBinding;
