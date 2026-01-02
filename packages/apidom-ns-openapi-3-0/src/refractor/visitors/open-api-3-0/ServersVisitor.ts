import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import ServersElement from '../../../elements/nces/Servers.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';
import { isServerLikeElement } from '../../predicates.ts';

/**
 * @public
 */
export type { BaseSpecificationVisitorOptions as ServersVisitorOptions };

/**
 * @public
 */
class ServersVisitor extends BaseSpecificationVisitor {
  declare public readonly element: ServersElement;

  constructor(options: BaseSpecificationVisitorOptions) {
    super(options);
    this.element = new ServersElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element) => {
      const specPath = isServerLikeElement(item) ? ['document', 'objects', 'Server'] : ['value'];
      const element = this.toRefractedElement(specPath, item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default ServersVisitor;
