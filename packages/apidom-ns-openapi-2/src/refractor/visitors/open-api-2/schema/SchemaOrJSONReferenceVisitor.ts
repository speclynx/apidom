import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  specificationObj as JSONSchemaDraft4Specification,
  isJSONReferenceElement,
  JSONReferenceElement,
  SchemaOrReferenceVisitorOptions,
  SchemaOrReferenceVisitor as SchemaOrReferenceVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-4';

import SchemaElement from '../../../../elements/Schema.ts';

export type { SchemaOrReferenceVisitorOptions };

/**
 * @public
 */

export const JSONSchemaOrJSONReferenceVisitor: typeof SchemaOrReferenceVisitorType =
  JSONSchemaDraft4Specification.visitors.JSONSchemaOrJSONReferenceVisitor;

/**
 * @public
 */
class SchemaOrJSONReferenceVisitor extends JSONSchemaOrJSONReferenceVisitor {
  declare public element: SchemaElement | JSONReferenceElement;

  ObjectElement(path: Path<ObjectElement>) {
    JSONSchemaOrJSONReferenceVisitor.prototype.enter.call(this, path);

    if (isJSONReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'schema');
    }
  }
}

export default SchemaOrJSONReferenceVisitor;
