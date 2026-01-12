import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item: Element) => {
      const tagElement = this.toRefractedElement(['document', 'objects', 'Tag'], item);
      this.element.push(tagElement);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default TagsVisitor;
