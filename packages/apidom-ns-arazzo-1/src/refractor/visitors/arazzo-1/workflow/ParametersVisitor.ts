import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import WorkflowParametersElement from '../../../../elements/nces/WorkflowParameters.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';
import { isReusableLikeElement } from '../../../predicates.ts';
import { isReusableElement } from '../../../../predicates.ts';

/**
 * @public
 */
export interface ParametersVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class ParametersActionsVisitor extends BaseSpecificationFallbackVisitor {
  declare public readonly element: WorkflowParametersElement;

  constructor(options: ParametersVisitorOptions) {
    super(options);
    this.element = new WorkflowParametersElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = isReusableLikeElement(item)
        ? ['document', 'objects', 'Reusable']
        : ['document', 'objects', 'Parameter'];
      const element = this.toRefractedElement(specPath, item);

      if (isReusableElement(element)) {
        element.meta.set('referenced-element', 'parameter');
      }

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default ParametersActionsVisitor;
