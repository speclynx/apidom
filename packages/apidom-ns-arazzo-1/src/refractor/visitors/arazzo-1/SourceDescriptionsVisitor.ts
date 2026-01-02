import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import SourceDescriptionsElement from '../../../elements/nces/SourceDescriptions.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from './bases.ts';

/**
 * @public
 */
export interface SourceDescriptionsVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class SourceDescriptionsVisitor extends BaseSpecificationFallbackVisitor {
  public readonly element: SourceDescriptionsElement;

  constructor(options: SourceDescriptionsVisitorOptions) {
    super(options);
    this.element = new SourceDescriptionsElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'SourceDescription'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default SourceDescriptionsVisitor;
