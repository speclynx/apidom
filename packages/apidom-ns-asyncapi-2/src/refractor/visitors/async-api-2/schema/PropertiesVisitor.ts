import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  specificationObj as JSONSchemaDraft7Specification,
  PropertiesVisitorOptions,
  PropertiesVisitor as PropertiesVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-7';

import ReferenceElement from '../../../../elements/Reference.ts';
import { isReferenceElement } from '../../../../predicates.ts';

export type { PropertiesVisitorOptions };

/**
 * @public
 */
export const JSONSchemaPropertiesVisitor: typeof PropertiesVisitorType =
  JSONSchemaDraft7Specification.visitors.document.objects.JSONSchema.fixedFields.properties;

/**
 * @public
 */
class PropertiesVisitor extends JSONSchemaPropertiesVisitor {
  ObjectElement(path: Path<ObjectElement>) {
    JSONSchemaPropertiesVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'schema');
    });
  }
}

export default PropertiesVisitor;
