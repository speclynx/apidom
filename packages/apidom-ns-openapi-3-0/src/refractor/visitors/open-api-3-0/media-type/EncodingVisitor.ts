import { always } from 'ramda';

import MediaTypeEncodingElement from '../../../../elements/nces/MediaTypeEncoding.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

export type { BaseMapVisitorOptions as EncodingVisitorOptions };

/**
 * @public
 */
class EncodingVisitor extends BaseMapVisitor {
  declare public readonly element: MediaTypeEncodingElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Encoding']>;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new MediaTypeEncodingElement();
    this.specPath = always(['document', 'objects', 'Encoding']);
  }
}

export default EncodingVisitor;
