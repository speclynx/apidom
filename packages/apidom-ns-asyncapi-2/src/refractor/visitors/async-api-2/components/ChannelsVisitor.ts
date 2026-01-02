import { always } from 'ramda';

import ComponentsChannelsElement from '../../../../elements/nces/ComponentsChannels.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type ChannelsVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class ChannelsVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsChannelsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ChannelItem']>;

  constructor(options: ChannelsVisitorOptions) {
    super(options);
    this.element = new ComponentsChannelsElement();
    this.specPath = always(['document', 'objects', 'ChannelItem']);
  }
}

export default ChannelsVisitor;
