import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'Criterion'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default CriteriaVisitor;
