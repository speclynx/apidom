import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import SwaggerTagsElement from '../../../elements/nces/SwaggerTags.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';

export type { BaseSpecificationVisitorOptions as TagsVisitorOptions };

/**
 * @public
 */
class TagsVisitor extends BaseSpecificationVisitor {
  declare public readonly element: SwaggerTagsElement;

  constructor(options: BaseSpecificationVisitorOptions) {
    super(options);
    this.element = new SwaggerTagsElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'Tag'];
      const element = this.toRefractedElement(specPath, item);
      this.element.push(element);
    });
    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default TagsVisitor;
