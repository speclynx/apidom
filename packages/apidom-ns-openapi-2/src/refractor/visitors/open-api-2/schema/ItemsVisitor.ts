import { ArrayElement, ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
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
  ObjectElement(path: Path<ObjectElement>) {
    JSONSchemaItemsVisitor.prototype.ObjectElement.call(this, path);

    if (isJSONReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'schema');
    }
  }

  ArrayElement(path: Path<ArrayElement>) {
    JSONSchemaItemsVisitor.prototype.ArrayElement.call(this, path);

    this.element
      .filter(isJSONReferenceElement)
      // @ts-ignore
      .forEach((referenceElement: JSONReferenceElement) => {
        referenceElement.meta.set('referenced-element', 'schema');
      });
  }
}

export default ItemsVisitor;
