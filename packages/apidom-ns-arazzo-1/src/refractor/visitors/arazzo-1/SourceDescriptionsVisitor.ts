import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = ['document', 'objects', 'SourceDescription'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default SourceDescriptionsVisitor;
