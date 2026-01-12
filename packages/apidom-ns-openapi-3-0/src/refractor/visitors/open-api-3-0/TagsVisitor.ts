import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import TagsElement from '../../../elements/nces/Tags.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';
import { isTagLikeElement } from '../../predicates.ts';

/**
 * @public
 */
export type { BaseSpecificationVisitorOptions as TagsVisitorOptions };

/**
 * @public
 */
class TagsVisitor extends BaseSpecificationVisitor {
  declare public readonly element: TagsElement;

  constructor(options: BaseSpecificationVisitorOptions) {
    super(options);
    this.element = new TagsElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item: Element) => {
      const specPath = isTagLikeElement(item) ? ['document', 'objects', 'Tag'] : ['value'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default TagsVisitor;
