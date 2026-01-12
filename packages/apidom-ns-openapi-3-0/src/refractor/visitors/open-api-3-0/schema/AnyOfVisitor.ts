import { ArrayElement } from '@speclynx/apidom-datamodel';
import {
  specificationObj as JSONSchemaDraft4Specification,
  AnyOfVisitorOptions,
  AnyOfVisitor as AnyOfVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-4';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import { isReferenceElement } from '../../../../predicates.ts';

export type { AnyOfVisitorOptions };

/**
 * @public
 */
export const JSONSchemaAnyOfVisitor: typeof AnyOfVisitorType =
  JSONSchemaDraft4Specification.visitors.document.objects.JSONSchema.fixedFields.anyOf;

/**
 * @public
 */
class AnyOfVisitor extends JSONSchemaAnyOfVisitor {
  ArrayElement(path: Path<ArrayElement>) {
    JSONSchemaAnyOfVisitor.prototype.ArrayElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'schema');
    });
  }
}

export default AnyOfVisitor;
