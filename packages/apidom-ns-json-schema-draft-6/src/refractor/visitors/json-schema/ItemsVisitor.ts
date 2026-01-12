import { BooleanElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  ItemsVisitor as JSONSchemaDraft4ItemsVisitor,
  ItemsVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-draft-4';

export type { ItemsVisitorOptions };

/**
 * @public
 */
class ItemsVisitor extends JSONSchemaDraft4ItemsVisitor {
  BooleanElement(path: Path<BooleanElement>) {
    this.element = this.toRefractedElement(['document', 'objects', 'JSONSchema'], path.node);

    path.stop();
  }
}

export default ItemsVisitor;
