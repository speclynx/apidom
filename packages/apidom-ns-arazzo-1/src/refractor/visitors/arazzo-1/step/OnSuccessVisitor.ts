import { Mixin } from 'ts-mixer';
import { ArrayElement, Element, BREAK } from '@speclynx/apidom-core';

import StepOnSuccessElement from '../../../../elements/nces/StepOnSuccess.ts';
import SpecificationVisitor, { SpecificationVisitorOptions } from '../../SpecificationVisitor.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import { isReusableLikeElement } from '../../../predicates.ts';
import { isReusableElement } from '../../../../predicates.ts';

/**
 * @public
 */
export interface OnSuccessVisitorOptions
  extends SpecificationVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class OnSuccessVisitor extends Mixin(SpecificationVisitor, FallbackVisitor) {
  declare public readonly element: StepOnSuccessElement;

  constructor(options: OnSuccessVisitorOptions) {
    super(options);
    this.element = new StepOnSuccessElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const specPath = isReusableLikeElement(item)
        ? ['document', 'objects', 'Reusable']
        : ['document', 'objects', 'SuccessAction'];
      const element = this.toRefractedElement(specPath, item);

      if (isReusableElement(element)) {
        element.setMetaProperty('referenced-element', 'successAction');
      }

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default OnSuccessVisitor;
