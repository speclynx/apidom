import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import StepDependsOnElement from '../../../../elements/nces/StepDependsOn.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';

/**
 * @public
 */
export interface StepDependsOnVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class StepDependsOnVisitor extends BaseSpecificationFallbackVisitor {
  public readonly element: StepDependsOnElement;

  constructor(options: StepDependsOnVisitorOptions) {
    super(options);
    this.element = new StepDependsOnElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = ['value'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default StepDependsOnVisitor;
