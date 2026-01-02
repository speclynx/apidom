import { always } from 'ramda';

import MediaTypeElement from '../../../../elements/MediaType.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as MediaTypeVisitorOptions };

/**
 * @public
 */
class MediaTypeVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MediaTypeElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'MediaType']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new MediaTypeElement();
    this.specPath = always(['document', 'objects', 'MediaType']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default MediaTypeVisitor;
