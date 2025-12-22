import { Mixin } from 'ts-mixer';
import { ArrayElement, Element, BREAK } from '@speclynx/apidom-core';

import RequestBodyReplacementsElement from '../../../../elements/nces/RequestBodyReplacements.ts';
import SpecificationVisitor, { SpecificationVisitorOptions } from '../../SpecificationVisitor.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

/**
 * @public
 */
export interface ReplacementsVisitorOptions
  extends SpecificationVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class ReplacementsVisitor extends Mixin(SpecificationVisitor, FallbackVisitor) {
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
