import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import WorkflowFailureActionsElement from '../../../../elements/nces/WorkflowFailureActions.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';
import { isReusableLikeElement } from '../../../predicates.ts';
import { isReusableElement } from '../../../../predicates.ts';

/**
 * @public
 */
export interface FailureActionsVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class FailureActionsVisitor extends BaseSpecificationFallbackVisitor {
  declare public readonly element: WorkflowFailureActionsElement;

  constructor(options: FailureActionsVisitorOptions) {
    super(options);
    this.element = new WorkflowFailureActionsElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = isReusableLikeElement(item)
        ? ['document', 'objects', 'Reusable']
        : ['document', 'objects', 'FailureAction'];
      const element = this.toRefractedElement(specPath, item);

      if (isReusableElement(element)) {
        element.meta.set('referenced-element', 'failureAction');
      }

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default FailureActionsVisitor;
