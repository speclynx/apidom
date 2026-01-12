import { ObjectElement, ArrayElement, BooleanElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { BaseSchemaArrayVisitor, BaseSchemaArrayVisitorOptions } from './bases.ts';

/**
 * @public
 */
export type ItemsVisitorOptions = BaseSchemaArrayVisitorOptions;

/**
 * @public
 */
class ItemsVisitor extends BaseSchemaArrayVisitor {
  declare public element: ObjectElement | ArrayElement;

  ObjectElement(path: Path<ObjectElement>) {
    this.element = this.toRefractedElement(['document', 'objects', 'JSONSchema'], path.node);

    path.stop();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    this.element = new ArrayElement();
    this.element.classes.push('json-schema-items');

    arrayElement.forEach((item: Element): void => {
      const element = this.toRefractedElement(['document', 'objects', 'JSONSchema'], item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }

  BooleanElement(path: Path<BooleanElement>) {
    this.element = this.toRefractedElement(['document', 'objects', 'JSONSchema'], path.node);

    path.stop();
  }
}

export default ItemsVisitor;
