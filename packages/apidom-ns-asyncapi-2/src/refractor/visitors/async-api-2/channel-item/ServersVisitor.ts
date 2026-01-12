import { ArrayElement, Element, isStringElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item: Element) => {
      const element = cloneDeep(item);

      if (isStringElement(element)) {
        element.classes.push('server-name');
      }

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default ServersVisitor;
