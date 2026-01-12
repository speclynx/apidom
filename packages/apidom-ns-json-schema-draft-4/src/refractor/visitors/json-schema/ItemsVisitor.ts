import { ObjectElement, ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';
import { FallbackVisitorOptions } from '../FallbackVisitor.ts';
import { ParentSchemaAwareVisitorOptions } from './ParentSchemaAwareVisitor.ts';
import { ItemsVisitorBase } from './bases.ts';
import { isJSONReferenceLikeElement } from '../../predicates.ts';

/**
 * @public
 */
export interface ItemsVisitorOptions
  extends SpecificationVisitorOptions, ParentSchemaAwareVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class ItemsVisitor extends ItemsVisitorBase {
  declare public element: ArrayElement | ObjectElement;

  ObjectElement(path: Path<ObjectElement>) {
    const objectElement = path.node;
    const specPath = isJSONReferenceLikeElement(objectElement)
      ? ['document', 'objects', 'JSONReference']
      : ['document', 'objects', 'JSONSchema'];
    this.element = this.toRefractedElement(specPath, objectElement);

    path.stop();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    this.element = new ArrayElement();
    this.element.classes.push('json-schema-items');

    arrayElement.forEach((item: Element): void => {
      const specPath = isJSONReferenceLikeElement(item)
        ? ['document', 'objects', 'JSONReference']
        : ['document', 'objects', 'JSONSchema'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default ItemsVisitor;
