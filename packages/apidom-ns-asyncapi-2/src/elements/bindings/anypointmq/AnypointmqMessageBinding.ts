import {
  ObjectElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import SchemaElement from '../../Schema.ts';
import ReferenceElement from '../../Reference.ts';

/**
 * @public
 */
class AnypointmqMessageBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'anypointmqMessageBinding';
    this.classes.push('message-binding');
  }

  get headers(): SchemaElement | ReferenceElement | undefined {
    return this.get('headers') as SchemaElement | ReferenceElement | undefined;
  }

  set headers(headers: SchemaElement | ReferenceElement | undefined) {
    this.set('headers', headers);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default AnypointmqMessageBinding;
