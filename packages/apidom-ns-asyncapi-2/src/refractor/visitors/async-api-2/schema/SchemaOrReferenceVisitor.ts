import { Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
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

  enter(path: Path<Element>) {
    JSONSchemaOrJSONReferenceVisitor.prototype.enter.call(this, path);

    if (isReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'schema');
    }
  }
}

export default SchemaOrReferenceVisitor;
