import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  specificationObj as JSONSchemaDraft7Specification,
  DefinitionsVisitorOptions,
  DefinitionsVisitor as DefinitionsVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-7';

import ReferenceElement from '../../../../elements/Reference.ts';
import { isReferenceElement } from '../../../../predicates.ts';

export type { DefinitionsVisitorOptions };

/**
 * @public
 */
export const JSONSchemaDefinitionsVisitor: typeof DefinitionsVisitorType =
  JSONSchemaDraft7Specification.visitors.document.objects.JSONSchema.fixedFields.definitions;

/**
 * @public
 */
class DefinitionsVisitor extends JSONSchemaDefinitionsVisitor {
  ObjectElement(path: Path<ObjectElement>) {
    JSONSchemaDefinitionsVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'schema');
    });
  }
}

export default DefinitionsVisitor;
