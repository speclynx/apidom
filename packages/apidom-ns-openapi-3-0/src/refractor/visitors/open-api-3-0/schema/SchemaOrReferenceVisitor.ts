import { ObjectElement } from '@speclynx/apidom-datamodel';
import {
  specificationObj as JSONSchemaDraft4Specification,
  JSONReferenceElement,
  SchemaOrReferenceVisitorOptions,
  SchemaOrReferenceVisitor as JSONSchemaOrJSONReferenceVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-4';

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

  ObjectElement(objectElement: ObjectElement) {
    const result = JSONSchemaOrJSONReferenceVisitor.prototype.enter.call(this, objectElement);

    if (isReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'schema');
    }

    return result;
  }
}

export default SchemaOrReferenceVisitor;
