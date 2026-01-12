import { ArrayElement, ObjectElement } from '@speclynx/apidom-datamodel';
import {
  ItemsVisitorOptions,
  ItemsVisitor as JSONSchemaItemsVisitor,
} from '@speclynx/apidom-ns-json-schema-draft-4';
import { Path } from '@speclynx/apidom-traverse';

import { isReferenceElement } from '../../../../predicates.ts';

export type { ItemsVisitorOptions };

export { JSONSchemaItemsVisitor };

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
    this.enter(path);
  }
}

export default ItemsVisitor;
