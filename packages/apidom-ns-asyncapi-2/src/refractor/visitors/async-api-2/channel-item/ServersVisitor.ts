import { ArrayElement, Element, isStringElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import ChannelItemServersElement from '../../../../elements/nces/ChannelItemsServers.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type ServersVisitorOptions = BaseSpecificationVisitorOptions;

/**
 * @public
 */
class ServersVisitor extends BaseSpecificationVisitor {
  declare public readonly element: ChannelItemServersElement;

  constructor(options: ServersVisitorOptions) {
    super(options);
    this.element = new ChannelItemServersElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element) => {
      const element = cloneDeep(item);

      if (isStringElement(element)) {
        element.classes.push('server-name');
      }

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default ServersVisitor;
