import { ArrayElement } from '@speclynx/apidom-core';
import {
  specificationObj as JSONSchemaDraft4Specification,
  TypeVisitorOptions,
  TypeVisitor as TypeVisitorOptionsType,
} from '@speclynx/apidom-ns-json-schema-draft-4';

export type { TypeVisitorOptions };

/**
 * @public
 */
export const JSONSchemaTypeVisitor: typeof TypeVisitorOptionsType =
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
