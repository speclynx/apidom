import { ObjectElement } from '@speclynx/apidom-datamodel';
import {
  specificationObj as JSONSchemaDraft4Specification,
  JSONReferenceElement,
  SchemaOrReferenceVisitorOptions,
  SchemaOrReferenceVisitor as JSONSchemaOrJSONReferenceVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-4';
import { Path } from '@speclynx/apidom-traverse';

import { isReferenceElement } from '../../../../predicates.ts';
import SchemaElement from '../../../../elements/Schema.ts';

export type { SchemaOrReferenceVisitorOptions };

/**
 * @public
 */
export const JSONSchemaOrJSONReferenceVisitor: typeof JSONSchemaOrJSONReferenceVisitorType =
  JSONSchemaDraft4Specification.visitors.JSONSchemaOrJSONReferenceVisitor;

/**
 * @public
 */
class SchemaOrReferenceVisitor extends JSONSchemaOrJSONReferenceVisitor {
  declare public element: SchemaElement | JSONReferenceElement;

  ObjectElement(path: Path<ObjectElement>) {
    JSONSchemaOrJSONReferenceVisitor.prototype.enter.call(this, path);

    if (isReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'schema');
    }
  }
}

export default SchemaOrReferenceVisitor;
