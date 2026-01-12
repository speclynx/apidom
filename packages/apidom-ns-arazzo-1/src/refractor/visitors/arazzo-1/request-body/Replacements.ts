import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'PayloadReplacement'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default ReplacementsVisitor;
