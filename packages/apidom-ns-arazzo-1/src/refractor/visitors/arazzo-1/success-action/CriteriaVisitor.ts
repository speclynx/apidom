import { Mixin } from 'ts-mixer';
import { ArrayElement, Element, BREAK } from '@speclynx/apidom-core';

import SuccessActionCriteriaElement from '../../../../elements/nces/SuccessActionCriteria.ts';
import SpecificationVisitor, { SpecificationVisitorOptions } from '../../SpecificationVisitor.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

/**
 * @public
 */
export interface CriteriaVisitorOptions
  extends SpecificationVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class CriteriaVisitor extends Mixin(SpecificationVisitor, FallbackVisitor) {
  public readonly element: SuccessActionCriteriaElement;

  constructor(options: CriteriaVisitorOptions) {
    super(options);
    this.element = new SuccessActionCriteriaElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'Criterion'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default CriteriaVisitor;
