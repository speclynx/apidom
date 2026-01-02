import { always } from 'ramda';

import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';
import type { SpecPath } from '../../generics/MapVisitor.ts';
import ChannelsElement from '../../../../elements/Channels.ts';

/**
 * @public
 */
export type ChannelsVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class ChannelsVisitor extends BaseMapVisitor {
  declare public readonly element: ChannelsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ChannelItem']>;

  constructor(options: ChannelsVisitorOptions) {
    super(options);
    this.element = new ChannelsElement();
    this.specPath = always(['document', 'objects', 'ChannelItem']);
  }
}

export default ChannelsVisitor;
