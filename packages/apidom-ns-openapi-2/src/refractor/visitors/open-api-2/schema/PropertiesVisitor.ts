import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  specificationObj as JSONSchemaDraft4Specification,
  JSONReferenceElement,
  isJSONReferenceElement,
  PropertiesVisitorOptions,
  PropertiesVisitor as PropertiesVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-4';

export type { PropertiesVisitorOptions };

/**
 * @public
 */
export const JSONSchemaPropertiesVisitor: typeof PropertiesVisitorType =
  JSONSchemaDraft4Specification.visitors.document.objects.JSONSchema.fixedFields.properties;

/**
 * @public
 */
class PropertiesVisitor extends JSONSchemaPropertiesVisitor {
  ObjectElement(path: Path<ObjectElement>) {
    JSONSchemaPropertiesVisitor.prototype.ObjectElement.call(this, path);

    this.element
      .filter(isJSONReferenceElement)
      // @ts-ignore
      .forEach((referenceElement: JSONReferenceElement) => {
        referenceElement.meta.set('referenced-element', 'schema');
      });
  }
}

export default PropertiesVisitor;
