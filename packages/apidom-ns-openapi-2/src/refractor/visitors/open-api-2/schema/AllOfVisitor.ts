import { ArrayElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  specificationObj as JSONSchemaDraft4Specification,
  isJSONReferenceElement,
  JSONReferenceElement,
  AllOfVisitorOptions,
  AllOfVisitor as AllOfVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-4';

export type { AllOfVisitorOptions };

/**
 * @public
 */
export const JSONSchemaAllOfVisitor: typeof AllOfVisitorType =
  JSONSchemaDraft4Specification.visitors.document.objects.JSONSchema.fixedFields.allOf;

/**
 * @public
 */
class AllOfVisitor extends JSONSchemaAllOfVisitor {
  ArrayElement(path: Path<ArrayElement>) {
    JSONSchemaAllOfVisitor.prototype.ArrayElement.call(this, path);

    this.element
      .filter(isJSONReferenceElement)
      // @ts-ignore
      .forEach((referenceElement: JSONReferenceElement) => {
        referenceElement.meta.set('referenced-element', 'schema');
      });
  }
}

export default AllOfVisitor;
