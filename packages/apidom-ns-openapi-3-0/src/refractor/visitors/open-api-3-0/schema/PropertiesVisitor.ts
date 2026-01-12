import { ObjectElement } from '@speclynx/apidom-datamodel';
import {
  specificationObj as JSONSchemaDraft4Specification,
  PropertiesVisitorOptions,
  PropertiesVisitor as PropertiesVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-4';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import { isReferenceElement } from '../../../../predicates.ts';

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

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'schema');
    });
  }
}

export default PropertiesVisitor;
