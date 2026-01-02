import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import FailureActionCriteriaElement from '../../../../elements/nces/FailureActionCriteria.ts';
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
  public readonly element: FailureActionCriteriaElement;

  constructor(options: CriteriaVisitorOptions) {
    super(options);
    this.element = new FailureActionCriteriaElement();
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
