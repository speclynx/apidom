import { Element } from '@speclynx/apidom-core';
import {
  specificationObj as JSONSchemaDraft7Specification,
  SchemaOrReferenceVisitorOptions,
  SchemaOrReferenceVisitor as SchemaOrReferenceVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-7';

import { isReferenceElement } from '../../../../predicates.ts';
import SchemaElement from '../../../../elements/Schema.ts';
import JSONReferenceElement from '../../../../elements/Reference.ts';

export type { SchemaOrReferenceVisitorOptions };

/**
 * @public
 */

export const JSONSchemaOrJSONReferenceVisitor: typeof SchemaOrReferenceVisitorType =
  JSONSchemaDraft7Specification.visitors.JSONSchemaOrJSONReferenceVisitor;

/**
 * @public
 */
class SchemaOrReferenceVisitor extends JSONSchemaOrJSONReferenceVisitor {
  declare public element: SchemaElement | JSONReferenceElement;

  enter(element: Element) {
    const result = JSONSchemaOrJSONReferenceVisitor.prototype.enter.call(this, element);

    if (isReferenceElement(this.element)) {
      this.element.setMetaProperty('referenced-element', 'schema');
    }

    return result;
  }
}

export default SchemaOrReferenceVisitor;
