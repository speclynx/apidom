import { ArrayElement, ObjectElement } from '@speclynx/apidom-datamodel';
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
  ObjectElement(objectElement: ObjectElement) {
    const result = JSONSchemaItemsVisitor.prototype.ObjectElement.call(this, objectElement);

    if (isReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'schema');
    }

    return result;
  }

  ArrayElement(arrayElement: ArrayElement) {
    const result = JSONSchemaItemsVisitor.prototype.ArrayElement.call(this, arrayElement);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'schema');
    });

    return result;
  }
}

export default ItemsVisitor;
