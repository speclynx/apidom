import { always } from 'ramda';

import MediaElement from '../../../../elements/Media.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { FixedFieldsVisitorOptions } from '../../generics/FixedFieldsVisitor.ts';
import { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import { MediaVisitorBase } from '../bases.ts';

/**
 * @public
 */
export interface MediaVisitorOptions extends FixedFieldsVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class MediaVisitor extends MediaVisitorBase {
  declare public readonly element: MediaElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Media']>;

  constructor(options: MediaVisitorOptions) {
    super(options);
    this.element = new MediaElement();
    this.specPath = always(['document', 'objects', 'Media']);
  }
}

export default MediaVisitor;
