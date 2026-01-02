import { ArrayElement, ObjectElement } from '@speclynx/apidom-datamodel';
import {
  JSONReferenceElement,
  isJSONReferenceElement,
  ItemsVisitorOptions,
  ItemsVisitor as JSONSchemaItemsVisitor,
} from '@speclynx/apidom-ns-json-schema-draft-4';

export type { ItemsVisitorOptions };

export { JSONSchemaItemsVisitor };

/**
 * @public
 */
class ItemsVisitor extends JSONSchemaItemsVisitor {
  ObjectElement(objectElement: ObjectElement) {
    const result = JSONSchemaItemsVisitor.prototype.ObjectElement.call(this, objectElement);

    if (isJSONReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'schema');
    }

    return result;
  }

  ArrayElement(arrayElement: ArrayElement) {
    const result = JSONSchemaItemsVisitor.prototype.ArrayElement.call(this, arrayElement);

    this.element
      .filter(isJSONReferenceElement)
      // @ts-ignore
      .forEach((referenceElement: JSONReferenceElement) => {
        referenceElement.meta.set('referenced-element', 'schema');
      });

    return result;
  }
}

export default ItemsVisitor;
