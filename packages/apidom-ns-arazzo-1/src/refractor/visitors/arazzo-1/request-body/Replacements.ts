import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import RequestBodyReplacementsElement from '../../../../elements/nces/RequestBodyReplacements.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';

/**
 * @public
 */
export interface ReplacementsVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class ReplacementsVisitor extends BaseSpecificationFallbackVisitor {
  public readonly element: RequestBodyReplacementsElement;

  constructor(options: ReplacementsVisitorOptions) {
    super(options);
    this.element = new RequestBodyReplacementsElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'PayloadReplacement'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default ReplacementsVisitor;
