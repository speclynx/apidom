import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import SuccessActionCriteriaElement from '../../../../elements/nces/SuccessActionCriteria.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';

/**
 * @public
 */
export interface CriteriaVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class CriteriaVisitor extends BaseSpecificationFallbackVisitor {
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
