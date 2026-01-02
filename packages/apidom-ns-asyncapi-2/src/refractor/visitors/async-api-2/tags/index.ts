import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import TagsElement from '../../../../elements/Tags.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type TagsVisitorOptions = BaseSpecificationVisitorOptions;

/**
 * @public
 */
class TagsVisitor extends BaseSpecificationVisitor {
  declare public readonly element: TagsElement;

  constructor(options: TagsVisitorOptions) {
    super(options);
    this.element = new TagsElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element) => {
      const tagElement = this.toRefractedElement(['document', 'objects', 'Tag'], item);
      this.element.push(tagElement);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default TagsVisitor;
