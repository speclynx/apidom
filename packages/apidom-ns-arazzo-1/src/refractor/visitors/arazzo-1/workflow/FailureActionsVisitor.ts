import { Mixin } from 'ts-mixer';
import { ArrayElement, Element, BREAK } from '@speclynx/apidom-core';

import WorkflowFailureActionsElement from '../../../../elements/nces/WorkflowFailureActions.ts';
import SpecificationVisitor, { SpecificationVisitorOptions } from '../../SpecificationVisitor.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import { isReusableLikeElement } from '../../../predicates.ts';
import { isReusableElement } from '../../../../predicates.ts';

/**
 * @public
 */
export interface FailureActionsVisitorOptions
  extends SpecificationVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class FailureActionsVisitor extends Mixin(SpecificationVisitor, FallbackVisitor) {
  declare public readonly element: WorkflowFailureActionsElement;

  constructor(options: FailureActionsVisitorOptions) {
    super(options);
    this.element = new WorkflowFailureActionsElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const specPath = isReusableLikeElement(item)
        ? ['document', 'objects', 'Reusable']
        : ['document', 'objects', 'FailureAction'];
      const element = this.toRefractedElement(specPath, item);

      if (isReusableElement(element)) {
        element.setMetaProperty('referenced-element', 'failureAction');
      }

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default FailureActionsVisitor;
