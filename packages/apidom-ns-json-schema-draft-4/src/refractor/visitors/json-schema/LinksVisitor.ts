import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

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

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const linkDescriptionElement = this.toRefractedElement(
        ['document', 'objects', 'LinkDescription'],
        item,
      );
      this.element.push(linkDescriptionElement);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default LinksVisitor;
