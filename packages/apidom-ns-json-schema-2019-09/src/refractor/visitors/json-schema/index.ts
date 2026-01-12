import { ObjectElement, isStringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  FixedFieldsVisitor,
  JSONSchemaVisitor as JSONSchemaDraft7Visitor,
  JSONSchemaVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-draft-7';

import JSONSchemaElement from '../../../elements/JSONSchema.ts';

export type { JSONSchemaVisitorOptions };

/**
 * @public
 */
class JSONSchemaVisitor extends JSONSchemaDraft7Visitor {
  declare public element: JSONSchemaElement;

  constructor(options: JSONSchemaVisitorOptions) {
    super(options);
    this.element = new JSONSchemaElement();
  }

  get defaultDialectIdentifier(): string {
    return 'https://json-schema.org/draft/2019-09/schema';
  }

  ObjectElement(path: Path<ObjectElement>) {
    const objectElement = path.node;

    this.handleDialectIdentifier(objectElement);
    this.handleSchemaIdentifier(objectElement);

    // for further processing consider this Schema Element as parent for all embedded Schema Elements
    this.parent = this.element;
    FixedFieldsVisitor.prototype.ObjectElement.call(this, path);

    // mark this SchemaElement with reference metadata
    if (isStringElement(this.element.$ref)) {
      this.element.classes.push('reference-element');
      this.element.meta.set('referenced-element', 'schema');
    }
  }
}

export default JSONSchemaVisitor;
