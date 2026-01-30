import { type Attributes, type Meta } from '@speclynx/apidom-datamodel';
import { JSONSchemaElement } from '@speclynx/apidom-ns-json-schema-2020-12';

/**
 * @public
 */
class JSONSchema extends JSONSchemaElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'jSONSchema';
  }
}

export default JSONSchema;
