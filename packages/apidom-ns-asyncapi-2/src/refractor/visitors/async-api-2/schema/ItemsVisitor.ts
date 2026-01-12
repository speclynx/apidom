import { ArrayElement, ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  specificationObj as JSONSchemaDraft7Specification,
  ItemsVisitorOptions,
  JSONSchemaDraft4ItemsVisitor as JSONSchemaDraft4ItemsVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-7';

import ReferenceElement from '../../../../elements/Reference.ts';
import { isReferenceElement } from '../../../../predicates.ts';

export type { ItemsVisitorOptions };

/**
 * @public
 */
export const JSONSchemaItemsVisitor: typeof JSONSchemaDraft4ItemsVisitorType =
  JSONSchemaDraft7Specification.visitors.document.objects.JSONSchema.fixedFields.items
    .$visitor as typeof JSONSchemaDraft4ItemsVisitorType;

/**
 * @public
 */
class ItemsVisitor extends JSONSchemaItemsVisitor {
  ObjectElement(path: Path<ObjectElement>) {
    JSONSchemaItemsVisitor.prototype.ObjectElement.call(this, path);

    if (isReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'schema');
    }
  }

  ArrayElement(path: Path<ArrayElement>) {
    JSONSchemaItemsVisitor.prototype.ArrayElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'schema');
    });
  }
}

export default ItemsVisitor;
