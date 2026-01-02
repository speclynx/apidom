import { ArrayElement } from '@speclynx/apidom-datamodel';
import {
  specificationObj as JSONSchemaDraft4Specification,
  TypeVisitorOptions,
  TypeVisitor as TypeVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-4';

export type { TypeVisitorOptions };

/**
 * @public
 */
export const JSONSchemaTypeVisitor: typeof TypeVisitorType =
  JSONSchemaDraft4Specification.visitors.document.objects.JSONSchema.fixedFields.type;

/**
 * @public
 */
class TypeVisitor extends JSONSchemaTypeVisitor {
  ArrayElement(arrayElement: ArrayElement) {
    const result = this.enter(arrayElement);
    return result;
  }
}

export default TypeVisitor;
