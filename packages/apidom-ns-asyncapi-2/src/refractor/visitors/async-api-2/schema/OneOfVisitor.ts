import { ArrayElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  specificationObj as JSONSchemaDraft7Specification,
  OneOfVisitorOptions,
  OneOfVisitor as OneOfVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-7';

import ReferenceElement from '../../../../elements/Reference.ts';
import { isReferenceElement } from '../../../../predicates.ts';

export type { OneOfVisitorOptions };

/**
 * @public
 */
export const JSONSchemaOneOfVisitor: typeof OneOfVisitorType =
  JSONSchemaDraft7Specification.visitors.document.objects.JSONSchema.fixedFields.oneOf;

/**
 * @public
 */
class OneOfVisitor extends JSONSchemaOneOfVisitor {
  ArrayElement(path: Path<ArrayElement>) {
    JSONSchemaOneOfVisitor.prototype.ArrayElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'schema');
    });
  }
}

export default OneOfVisitor;
