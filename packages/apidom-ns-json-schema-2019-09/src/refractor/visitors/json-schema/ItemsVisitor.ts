import { ObjectElement, ArrayElement, BooleanElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

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

  ObjectElement(objectElement: ObjectElement) {
    this.element = this.toRefractedElement(['document', 'objects', 'JSONSchema'], objectElement);

    return BREAK;
  }

  ArrayElement(arrayElement: ArrayElement) {
    this.element = new ArrayElement();
    this.element.classes.push('json-schema-items');

    arrayElement.forEach((item: Element): void => {
      const element = this.toRefractedElement(['document', 'objects', 'JSONSchema'], item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }

  BooleanElement(booleanElement: BooleanElement) {
    this.element = this.toRefractedElement(['document', 'objects', 'JSONSchema'], booleanElement);

    return BREAK;
  }
}

export default ItemsVisitor;
