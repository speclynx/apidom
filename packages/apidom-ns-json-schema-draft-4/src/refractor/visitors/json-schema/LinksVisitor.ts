import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { FallbackVisitorOptions } from '../FallbackVisitor.ts';
import { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';
import { ParentSchemaAwareVisitorOptions } from './ParentSchemaAwareVisitor.ts';
import { LinksVisitorBase } from './bases.ts';

/**
 * @public
 */
export interface LinksVisitorOptions
  extends SpecificationVisitorOptions, ParentSchemaAwareVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class LinksVisitor extends LinksVisitorBase {
  declare public readonly element: ArrayElement;

  constructor(options: LinksVisitorOptions) {
    super(options);
    this.element = new ArrayElement();
    this.element.classes.push('json-schema-links');
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const linkDescriptionElement = this.toRefractedElement(
        ['document', 'objects', 'LinkDescription'],
        item,
      );
      this.element.push(linkDescriptionElement);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default LinksVisitor;
