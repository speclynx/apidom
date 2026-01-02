import { ArrayElement, ObjectElement } from '@speclynx/apidom-datamodel';
import {
  ItemsVisitorOptions,
  ItemsVisitor as JSONSchemaItemsVisitor,
} from '@speclynx/apidom-ns-json-schema-draft-4';

import { isReferenceElement } from '../../../../predicates.ts';

export type { ItemsVisitorOptions };

export { JSONSchemaItemsVisitor };

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
    const result = this.enter(arrayElement);
    return result;
  }
}

export default ItemsVisitor;
