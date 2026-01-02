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
class KafkaMessageBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'kafkaMessageBinding';
    this.classes.push('message-binding');
  }

  get key(): SchemaElement | ReferenceElement | undefined {
    return this.get('key') as SchemaElement | ReferenceElement | undefined;
  }

  set key(key: SchemaElement | ReferenceElement | undefined) {
    this.set('key', key);
  }

  get schemaIdLocation(): StringElement | undefined {
    return this.get('schemaIdLocation') as StringElement | undefined;
  }

  set schemaIdLocation(schemaIdLocation: StringElement | undefined) {
    this.set('schemaIdLocation', schemaIdLocation);
  }

  get schemaIdPayloadEncoding(): StringElement | undefined {
    return this.get('schemaIdPayloadEncoding') as StringElement | undefined;
  }

  set schemaIdPayloadEncoding(schemaIdPayloadEncoding: StringElement | undefined) {
    this.set('schemaIdPayloadEncoding', schemaIdPayloadEncoding);
  }

  get schemaLookupStrategy(): StringElement | undefined {
    return this.get('schemaLookupStrategy') as StringElement | undefined;
  }

  set schemaLookupStrategy(schemaLookupStrategy: StringElement | undefined) {
    this.set('schemaLookupStrategy', schemaLookupStrategy);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default KafkaMessageBinding;
