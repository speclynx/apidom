import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import WorkflowSuccessActionsElement from '../../../../elements/nces/WorkflowSuccessActions.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';
import { isReusableLikeElement } from '../../../predicates.ts';
import { isReusableElement } from '../../../../predicates.ts';

/**
 * @public
 */
export interface SuccessActionsVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class SuccessActionsVisitor extends BaseSpecificationFallbackVisitor {
  declare public readonly element: WorkflowSuccessActionsElement;

  constructor(options: SuccessActionsVisitorOptions) {
    super(options);
    this.element = new WorkflowSuccessActionsElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = isReusableLikeElement(item)
        ? ['document', 'objects', 'Reusable']
        : ['document', 'objects', 'SuccessAction'];
      const element = this.toRefractedElement(specPath, item);

      if (isReusableElement(element)) {
        element.meta.set('referenced-element', 'successAction');
      }

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default SuccessActionsVisitor;
